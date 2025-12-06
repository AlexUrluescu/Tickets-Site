// database.js (ES Module)
import mysql from "mysql2";
import express from "express";
import cors from "cors";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import crypto from "crypto";
import dotenv from "dotenv";

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Eroare configurare email:", error);
    console.log("Verifică EMAIL_USER și EMAIL_PASS în .env");
  } else {
    console.log("Server email configurat cu succes!");
  }
});

function generateTicketCode() {
  return "TKT" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

function generateInvitationNumber() {
  return "POHR" + Math.floor(Math.random() * 90000 + 10000);
}

async function createTicketPDF(ticketData) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Header
      doc.rect(0, 0, doc.page.width, 80).fill("#f0f0f0");

      doc
        .fillColor("#000000")
        .fontSize(20)
        .text(
          "GameDaySibiu - FC Hermannstadt vs " +
            (ticketData.awayTeam || "Echipa Oaspete"),
          50,
          25,
          {
            align: "center",
          }
        );

      doc
        .fontSize(12)
        .text(
          `Data: ${ticketData.matchDate}, Ora: ${ticketData.matchTime}`,
          50,
          55
        )
        .text("Stadion Municipal, Sibiu", 50, 70);

      // Separator
      doc.moveTo(50, 100).lineTo(550, 100).stroke();

      // QR Code
      const qrCodeData = {
        ticketId: ticketData.ticketId,
        sector: ticketData.sector,
        row: ticketData.row,
        seats: ticketData.seats,
      };

      try {
        const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrCodeData));
        const qrBuffer = Buffer.from(qrCodeImage.split(",")[1], "base64");
        doc.image(qrBuffer, 50, 120, { width: 100 });
      } catch (qrError) {
        console.error("Eroare generare QR:", qrError);
      }

      // Detalii bilet
      doc.fontSize(14).text("DETALII BILET", 200, 120, { underline: true });

      doc
        .fontSize(12)
        .text(`Sector: ${ticketData.sector}`, 200, 150)
        .text(`Tribuna: ${ticketData.tribuna}`, 200, 170)
        .text(`Rand: ${ticketData.row}`, 200, 190)
        .text(`Locuri: ${ticketData.seats}`, 200, 210)
        .text(`Numar bilete: ${ticketData.numberOfTickets}`, 200, 230)
        .text(`Pret total: ${ticketData.totalPrice} RON`, 200, 250);

      // Cod invitație
      doc.fontSize(14).text("INVITATIE", 400, 120, { underline: true });

      doc.fontSize(16).text(ticketData.invitationCode, 400, 150);

      // Separator
      doc.moveTo(50, 280).lineTo(550, 280).stroke();

      // Deținător
      doc.fontSize(14).text("DETINATOR", 50, 300, { underline: true });

      doc
        .fontSize(12)
        .text(`Nume: ${ticketData.userName}`, 50, 330)
        .text(`Email: ${ticketData.userEmail}`, 50, 350);

      // Informații importante
      doc
        .fontSize(14)
        .text("INFORMATII IMPORTANTE", 50, 410, { underline: true });

      doc
        .fontSize(10)
        .text(
          "• Biletul trebuie prezentat la poarta si este valabil pentru o singura persoana",
          50,
          440
        )
        .text(
          "• Accesul se face doar prin intrarile indicate pe bilet",
          50,
          455
        )
        .text("• Copiii sub 14 ani trebuie sa prezinte bilet valabil", 50, 470)
        .text(
          "• Acest bilet este valabil numai insotit de un act de identitate",
          50,
          485
        )
        .text("• Falsificarea biletelor se pedepseste conform legii", 50, 500)
        .text(
          "• Pe stadion, spectatorilor le este INTERZIS sa intre cu:",
          50,
          515
        );

      const restrictions = [
        "Materiale pirotehnice de orice natura",
        "Sub influenta alcoolului",
        "Arme albe (cutite, surubelnite, metale ascuțite, etc.)",
        "Monede, brichete, umbrele, manunchiuri de chei",
        "Steaguri și bete din plastic cu diametrul mai mare de 16 mm",
        "Materiale de propaganda care incita la xenofobie",
      ];

      let yPos = 535;
      restrictions.forEach((restriction) => {
        doc.text(`  - ${restriction}`, 60, yPos);
        yPos += 15;
      });

      // Footer
      doc
        .fontSize(10)
        .fillColor("#666666")
        .text(`Organizator: FC Hermannstadt, RO34826156`, 50, 700)
        .text(`Contact gamedaysibiu.ro: +40755179942`, 50, 715)
        .text(`© 2025 www.gamedaysibiu.ro`, 50, 730, { align: "center" });

      // Cod bilet
      doc.rect(350, 650, 200, 60).stroke();
      doc
        .fontSize(8)
        .fillColor("#000000")
        .text(ticketData.ticketId, 355, 680, { align: "center", width: 190 });

      doc.end();
    } catch (error) {
      console.error("Eroare în createTicketPDF:", error);
      reject(error);
    }
  });
}

app.get("/api/away-team", (req, res) => {
  const now = new Date();
  const currentDate =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");

  pool.query(
    `
        SELECT echipe.nume AS awayTeamName, echipe.id AS awayTeamId, meciuri.id AS matchId
        FROM meciuri
                 JOIN echipe ON meciuri.echipa_deplasare_id = echipe.id
        WHERE meciuri.data >= ?
        ORDER BY meciuri.data ASC
            LIMIT 1
    `,
    [currentDate],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Eroare baza de date" });
      } else {
        const awayTeamName = results[0]?.awayTeamName || "Echipa necunoscută";
        const awayTeamId = results[0]?.awayTeamId || null;
        const matchId = results[0]?.matchId || null; // ← IMPORTANT: Adaugă această linie

        console.log("API away-team returnează:", {
          awayTeamName,
          awayTeamId,
          matchId,
        }); // Debug

        res.json({ awayTeamName, awayTeamId, matchId }); // ← IMPORTANT: Include matchId în răspuns
      }
    }
  );
});
app.get("/api/match-date", (req, res) => {
  const id = req.query.id;

  if (!id) {
    return res.status(400).json({ error: "ID echipă lipsă" });
  }

  pool.query(
    "SELECT data FROM meciuri WHERE echipa_deplasare_id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Eroare bază de date" });
      } else {
        const matchDate = results[0]?.data;
        const formattedDate = matchDate
          ? matchDate.toISOString().split("T")[0]
          : "Data nu a fost găsită";
        res.json({ matchDate: formattedDate });
      }
    }
  );
});
app.get("/api/match-time", (req, res) => {
  const id = req.query.id;

  if (!id) {
    return res.status(400).json({ error: "ID echipă lipsă" });
  }

  pool.query(
    "SELECT ora FROM meciuri WHERE echipa_deplasare_id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Eroare bază de date" });
      } else {
        const matchTime = results[0]?.ora || "Ora nu a fost găsită";
        res.json({ matchTime });
      }
    }
  );
});
app.get("/api/logos", (req, res) => {
  const id = req.query.id;
  pool.query(
    "SELECT logo_url AS awayTeamLogo FROM echipe WHERE id=?",
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        res
          .status(500)
          .json({ error: "Eroare la preluarea logo-urilor din baza de date" });
      } else {
        res.json({ awayTeamLogo: results[0]?.awayTeamLogo || null });
      }
    }
  );
});
app.get("/api/all-matches", (req, res) => {
  const currentDate = new Date().toISOString().split("T")[0];

  pool.query(
    `
        SELECT meciuri.id, meciuri.data, meciuri.ora, 
               echipe.nume AS awayTeamName, echipe.logo_url AS awayTeamLogo
        FROM meciuri
        JOIN echipe ON meciuri.echipa_deplasare_id = echipe.id
        WHERE meciuri.data >= ?
        ORDER BY meciuri.data ASC
    `,
    [currentDate],
    (err, results) => {
      if (err) {
        console.error("Eroare la extragerea meciurilor:", err);
        return res
          .status(500)
          .json({ error: "Eroare la extragerea meciurilor din baza de date" });
      }

      // Excludem primul meci (cel mai apropiat în timp)
      const [, ...restMatches] = results;

      const formattedMatches = restMatches.map((match) => ({
        id: match.id,
        matchDate: new Date(match.data).toISOString().split("T")[0],
        matchTime: match.ora,
        awayTeamName: match.awayTeamName,
        awayTeamLogo: match.awayTeamLogo,
      }));

      res.json({ matches: formattedMatches });
    }
  );
});
app.post("/api/check-email", (req, res) => {
  const { email } = req.body;
  pool.query(
    `SELECT DISTINCT 1 FROM users WHERE email = ?`,
    [email],
    (err, results) => {
      if (err) {
        console.error("Eroare la verificarea emailului:", err);
        return res.status(500).json({ error: "Eroare la server" });
      }

      if (results.length > 0) {
        res.json({ found: 1 });
      } else {
        res.json({ found: 0 });
      }
    }
  );
});
app.post("/api/check-password", (req, res) => {
  const { email } = req.body;
  pool.query(
    `SELECT password FROM users WHERE email = ?`,
    [email],
    (err, results) => {
      if (err) {
        console.error("Eroare la verificarea parolei:", err);
        return res.status(500).json({ error: "Eroare la server" });
      } else {
        res.json({ password: results[0]?.password || null });
      }
    }
  );
});
app.post("/api/get-name", (req, res) => {
  const { email } = req.body;
  pool.query(
    `SELECT nume AS numeUser FROM users WHERE email = ?`,
    [email],
    (err, results) => {
      if (err) {
        console.error("Eroare la preluarea numelui", err);
        return res.status(500).json({ error: "Eroare la server" });
      } else {
        res.json({ numeUser: results[0]?.numeUser || null });
      }
    }
  );
});
app.post("/api/add-user", (req, res) => {
  const { username, email, password } = req.body;

  pool.query(
    `INSERT INTO users (email,password,nume) VALUES (?,?,?)`,
    [email, password, username],
    (err, results) => {
      if (err) {
        console.error("Eroare la adaugarea username-ului", err);
        return res.status(500).json({ error: "Eroare la server" });
      }
      res.status(201).json({ message: "User adăugat cu succes" });
    }
  );
});
app.post("/api/populate-bilete", (req, res) => {
  // First, get all matches
  pool.query("SELECT id FROM meciuri", (err, matches) => {
    if (err) {
      console.error("Eroare la preluarea meciurilor:", err);
      return res.status(500).json({ error: "Eroare la preluarea meciurilor" });
    }

    // Delete existing tickets for all matches
    const toateSectoarele = [
      "A1",
      "A2",
      "A3",
      "VIP",
      "C1",
      "C2",
      "C3",
      "D1",
      "D2",
      "D3",
      "D4",
      "D5",
      "B1",
      "B2",
      "B3",
    ];
    pool.query(
      `DELETE FROM bilete WHERE sector IN (${toateSectoarele
        .map(() => "?")
        .join(",")})`,
      toateSectoarele,
      (err) => {
        if (err) {
          console.error("Eroare la ștergere:", err);
          return res.status(500).json({ error: "Eroare la ștergere" });
        }

        const zone = [
          // TRIBUNA 1
          {
            zona: "TRIBUNA 1",
            sector: "A1",
            randuri: [1, 6],
            locuriPerRand: 69,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 1",
            sector: "A1",
            randuri: [7, 11],
            locuriPerRand: 63,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 1",
            sector: "A1",
            randuri: [12, 17],
            locuriPerRand: 12,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 1",
            sector: "A2",
            randuri: [1, 4],
            locuriPerRand: 52,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 1",
            sector: "A2",
            randuri: [5, 6],
            locuriPerRand: 64,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 1",
            sector: "A2",
            randuri: [7, 11],
            locuriPerRand: 54,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 1",
            sector: "A3",
            randuri: [1, 6],
            locuriPerRand: 69,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 1",
            sector: "A3",
            randuri: [7, 11],
            locuriPerRand: 58,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 1",
            sector: "A3",
            randuri: [12, 17],
            locuriPerRand: 12,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 1",
            sector: "VIP",
            randuri: [1, 6],
            locuriPerRand: 66,
            pret: 100.0,
          },

          // TRIBUNA 2
          {
            zona: "TRIBUNA 2",
            sector: "C1",
            randuri: [1, 10],
            locuriPerRand: 54,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 2",
            sector: "C1",
            randuri: [11, 13],
            locuriPerRand: 44,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 2",
            sector: "C1",
            randuri: [13, 24],
            locuriPerRand: 53,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 2",
            sector: "C2",
            randuri: [1, 10],
            locuriPerRand: 54,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 2",
            sector: "C2",
            randuri: [11, 13],
            locuriPerRand: 44,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 2",
            sector: "C2",
            randuri: [13, 24],
            locuriPerRand: 53,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 2",
            sector: "C3",
            randuri: [1, 10],
            locuriPerRand: 54,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 2",
            sector: "C3",
            randuri: [11, 13],
            locuriPerRand: 44,
            pret: 50.0,
          },
          {
            zona: "TRIBUNA 2",
            sector: "C3",
            randuri: [13, 24],
            locuriPerRand: 53,
            pret: 50.0,
          },

          // PELUZA NORD
          ...["D1", "D2", "D3", "D4", "D5"].flatMap((sector) => [
            {
              zona: "PELUZA NORD",
              sector,
              randuri: [7, 8],
              locuriPerRand: 41,
              pret: 30.0,
            },
            {
              zona: "PELUZA NORD",
              sector,
              randuri: [9, 9],
              locuriPerRand: 42,
              pret: 30.0,
            },
            {
              zona: "PELUZA NORD",
              sector,
              randuri: [10, 10],
              locuriPerRand: 45,
              pret: 30.0,
            },
            {
              zona: "PELUZA NORD",
              sector,
              randuri: [11, 13],
              locuriPerRand: 52,
              pret: 30.0,
            },
            {
              zona: "PELUZA NORD",
              sector,
              randuri: [14, 19],
              locuriPerRand: 56,
              pret: 30.0,
            },
          ]),

          // PELUZA SUD
          ...["B1", "B2", "B3"].flatMap((sector) => [
            {
              zona: "PELUZA SUD",
              sector,
              randuri: [7, 8],
              locuriPerRand: 41,
              pret: 30.0,
            },
            {
              zona: "PELUZA SUD",
              sector,
              randuri: [9, 9],
              locuriPerRand: 42,
              pret: 30.0,
            },
            {
              zona: "PELUZA SUD",
              sector,
              randuri: [10, 10],
              locuriPerRand: 45,
              pret: 30.0,
            },
            {
              zona: "PELUZA SUD",
              sector,
              randuri: [11, 13],
              locuriPerRand: 52,
              pret: 30.0,
            },
            {
              zona: "PELUZA SUD",
              sector,
              randuri: [14, 19],
              locuriPerRand: 56,
              pret: 30.0,
            },
          ]),
        ];

        const bilete = [];

        // Create tickets for EACH match
        matches.forEach((match) => {
          for (const z of zone) {
            for (let rand = z.randuri[0]; rand <= z.randuri[1]; rand++) {
              for (let loc = 1; loc <= z.locuriPerRand; loc++) {
                bilete.push([
                  z.zona,
                  z.sector,
                  rand,
                  loc,
                  "disponibil",
                  z.pret,
                  match.id,
                ]);
              }
            }
          }
        });

        const insertQuery = `
                INSERT INTO bilete (zona, sector, rand, loc, status, pret, match_id)
                VALUES ?
            `;

        pool.query(insertQuery, [bilete], (err, result) => {
          if (err) {
            console.error("Eroare la inserare bilete:", err);
            return res.status(500).json({ error: "Eroare la inserare bilete" });
          }
          res.status(200).json({
            message: "Biletele au fost inserate cu succes",
            inserate: result.affectedRows,
            meciuri: matches.length,
          });
        });
      }
    );
  });
});
app.get("/api/dev/populeaza", (req, res) => {
  fetch("http://localhost:3000/api/populate-bilete", {
    method: "POST",
  })
    .then(() => res.send("Populat!"))
    .catch((err) => {
      console.error("Eroare la populare:", err);
      res.status(500).send("Eroare la populare");
    });
});
app.get("/api/sector-info", (req, res) => {
  const sector = req.query.sector;
  const matchId = req.query.matchId;

  if (!sector) {
    return res.status(400).json({ error: "Sector lipsă" });
  }

  if (!matchId) {
    return res.status(400).json({ error: "Match ID lipsă" });
  }

  pool.query(
    `
            SELECT COUNT(*) AS disponibile, MAX(pret) AS pret
            FROM bilete
            WHERE sector = ? AND status = 'disponibil' AND match_id = ?
        `,
    [sector, matchId],
    (err, results) => {
      if (err) {
        console.error("Eroare la interogare sector:", err);
        return res.status(500).json({ error: "Eroare server" });
      }

      const disponibile = results[0].disponibile;
      const pret = results[0].pret;

      // Anti-caching headers
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");

      res.json({ disponibile, pret });
    }
  );
});

app.get("/api/seats", (req, res) => {
  const sector = req.query.sector;
  const matchId = req.query.matchId;

  if (!sector) return res.status(400).json({ error: "sector missing" });
  if (!matchId) return res.status(400).json({ error: "matchId missing" });

  pool.query(
    `SELECT rand, loc, status
         FROM bilete
         WHERE sector = ? AND match_id = ?`,
    [sector, matchId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "db error" });
      }

      // Anti-caching headers
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");

      res.json(results);
    }
  );
});

// Endpoint pentru actualizarea stării locurilor rezervate
app.post("/api/update-seats-status", (req, res) => {
  const { seats, matchId } = req.body;

  if (!seats || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({
      error: "Date invalide - seats trebuie să fie un array de locuri",
    });
  }

  if (!matchId) {
    return res.status(400).json({ error: "Match ID lipsă" });
  }

  console.log(
    "Actualizare stare locuri pentru meciul:",
    matchId,
    "locuri:",
    seats
  );

  const updatePromises = seats.map((seatInfo) => {
    return new Promise((resolve, reject) => {
      let sector, rand, loc;

      if (typeof seatInfo === "string" && seatInfo.includes("-")) {
        if (seatInfo.includes(":")) {
          const [sectorInfo, locInfo] = seatInfo.split("-");
          sector = sectorInfo;
          [rand, loc] = locInfo.split(":");
        } else {
          const parts = seatInfo.split("-");
          if (parts.length === 3) {
            [sector, rand, loc] = parts;
          } else if (parts.length === 2) {
            [rand, loc] = parts;
          }
        }
      } else if (typeof seatInfo === "object") {
        sector = seatInfo.sector;
        rand = seatInfo.rand;
        loc = seatInfo.loc;
      }

      if (!sector || !rand || !loc) {
        console.error("Format invalid pentru locul:", seatInfo);
        return reject(new Error("Format invalid pentru loc"));
      }

      console.log(
        `Actualizare loc pentru meciul ${matchId}: Sector ${sector}, Rand ${rand}, Loc ${loc}`
      );

      // Include match_id in the update query
      pool.query(
        'UPDATE bilete SET status = "rezervat" WHERE sector = ? AND rand = ? AND loc = ? AND match_id = ?',
        [sector, rand, loc, matchId],
        (err, result) => {
          if (err) {
            console.error("Eroare la actualizarea locului:", err);
            reject(err);
          } else {
            console.log(
              `Actualizat cu succes pentru meciul ${matchId}: Sector ${sector}, Rand ${rand}, Loc ${loc}`
            );
            resolve(result);
          }
        }
      );
    });
  });

  Promise.all(updatePromises)
    .then(() => {
      console.log(
        "Toate locurile au fost actualizate cu succes pentru meciul:",
        matchId
      );
      res.status(200).json({
        success: true,
        message: "Locurile au fost actualizate cu succes",
      });
    })
    .catch((err) => {
      console.error("Eroare la actualizarea locurilor:", err);
      res.status(500).json({ error: "Eroare la actualizarea locurilor" });
    });
});

// Endpoint pentru a actualiza numărul de bilete disponibile pentru un sector
app.get("/api/update-sector-info", (req, res) => {
  const sector = req.query.sector;
  const matchId = req.query.matchId;

  if (!sector) {
    return res.status(400).json({ error: "Sector lipsă" });
  }

  if (!matchId) {
    return res.status(400).json({ error: "Match ID lipsă" });
  }

  pool.query(
    `
            SELECT COUNT(*) AS disponibile, MAX(pret) AS pret
            FROM bilete
            WHERE sector = ? AND status = 'disponibil' AND match_id = ?
        `,
    [sector, matchId],
    (err, results) => {
      if (err) {
        console.error("Eroare la actualizarea info sector:", err);
        return res.status(500).json({ error: "Eroare server" });
      }

      const disponibile = results[0].disponibile;
      const pret = results[0].pret;
      res.json({ disponibile, pret });
    }
  );
});

// Adaugă acest cod în database.js pentru test rapid

// Endpoint simplificat pentru procesare plată (pentru test)
app.post("/api/process-payment", async (req, res) => {
  console.log("=== PROCESARE PLATĂ NOUĂ ===");
  try {
    const {
      cardName,
      cardNumber,
      expirationDate,
      cvc,
      userEmail,
      userName,
      items,
      totalAmount,
      awayTeam,
      matchDate,
      matchTime,
      matchId,
    } = req.body;

    console.log("Date primite:", {
      userEmail,
      userName,
      totalAmount,
      itemsCount: items?.length,
      awayTeam,
      matchDate,
      matchTime,
      matchId,
    });

    // Validare
    if (!cardName || !cardNumber || !expirationDate || !cvc) {
      return res.status(400).json({
        success: false,
        error: "Date card incomplete",
      });
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: "Email lipsă",
      });
    }

    // Generare ID-uri
    const orderId = "ORD-" + Date.now();
    const paymentId = "PAY-" + Date.now();

    console.log("IDs generate:", { orderId, paymentId });

    // Salvare comandă
    pool.query(
      `INSERT INTO orders (order_id, user_email, user_name, total_amount, payment_id, status) 
             VALUES (?, ?, ?, ?, ?, 'completed')`,
      [orderId, userEmail, userName || cardName, totalAmount, paymentId],
      async (err, orderResult) => {
        if (err) {
          console.error("Eroare salvare comandă:", err);
          return res.status(500).json({
            success: false,
            error: "Eroare procesare comandă",
          });
        }

        console.log("Comandă salvată cu succes");

        try {
          // Array pentru biletele PDF
          const tickets = [];

          // Procesare fiecare item
          for (const item of items) {
            const ticketId = generateTicketCode();
            const invitationCode = generateInvitationNumber();

            console.log(`Procesare bilet: ${ticketId}`);

            // Salvare bilet în DB
            await new Promise((resolve, reject) => {
              const randValue = item.randuriSiLocuri
                ? JSON.stringify(item.randuriSiLocuri)
                : item.rand?.toString() || "";

              const locuriValue = item.randuriSiLocuri
                ? item.randuriSiLocuri.map((r) => r.locuri).join(", ")
                : item.numar_locuri?.toString() || "";

              pool.query(
                `INSERT INTO purchased_tickets 
                                 (ticket_id, order_id,match_id, sector, tribuna, rand, locuri, numar_bilete, pret, invitation_code) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
                [
                  ticketId,
                  orderId,
                  matchId,
                  item.sector,
                  item.tribuna,
                  randValue,
                  locuriValue,
                  item.numarBilete,
                  item.pret,
                  invitationCode,
                ],
                (err) => {
                  if (err) {
                    console.error("Eroare salvare bilet:", err);
                    reject(err);
                  } else {
                    resolve();
                  }
                }
              );
            });

            // Actualizare status locuri
            if (item.selectedSeatsKeys) {
              for (const seatKey of item.selectedSeatsKeys) {
                const [rand, loc] = seatKey.split("-");
                await new Promise((resolve) => {
                  pool.query(
                    `UPDATE bilete 
                 SET status = 'rezervat' 
                 WHERE sector = ? AND rand = ? AND loc = ? AND match_id = ?`,
                    [item.sector, rand, loc, matchId], // Include matchId here
                    (err, result) => {
                      if (err) {
                        console.error("Eroare la actualizarea locului:", err);
                      } else {
                        console.log(
                          `Loc actualizat pentru meciul ${matchId}: Sector ${item.sector}, Rand ${rand}, Loc ${loc}`
                        );
                      }
                      resolve();
                    }
                  );
                });
              }
            }

            // Pregătire date pentru PDF
            const ticketData = {
              ticketId,
              invitationCode,
              awayTeam: awayTeam || "Echipa Oaspete",
              matchDate: matchDate || new Date().toLocaleDateString("ro-RO"),
              matchTime: matchTime || "17:30",
              sector: item.sector,
              tribuna: item.tribuna,
              row: item.randuriSiLocuri
                ? item.randuriSiLocuri.map((r) => r.rand).join(", ")
                : item.rand?.toString() || "",
              seats: item.randuriSiLocuri
                ? item.randuriSiLocuri.map((r) => r.locuri).join(", ")
                : item.numar_locuri?.toString() || "",
              numberOfTickets: item.numarBilete,
              totalPrice: item.pret,
              userName: userName || cardName,
              userEmail: userEmail,
            };

            console.log("Generare PDF pentru:", ticketData.ticketId);

            // Generare PDF
            try {
              const pdfBuffer = await createTicketPDF(ticketData);
              tickets.push({
                filename: `bilet-${ticketId}.pdf`,
                content: pdfBuffer,
                encoding: "base64",
              });
              console.log("PDF generat cu succes");
            } catch (pdfError) {
              console.error("Eroare generare PDF:", pdfError);
            }
          }

          // Trimite email
          if (tickets.length > 0) {
            console.log(`Pregătire trimitere email către: ${userEmail}`);

            const mailOptions = {
              from: `"GameDay Sibiu" <${process.env.EMAIL_USER}>`,
              to: userEmail,
              subject: `Biletele dvs. pentru FC Hermannstadt - Comanda ${orderId}`,
              html: `
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <style>
                                        body { font-family: Arial, sans-serif; line-height: 1.6; }
                                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                        h2 { color: #333; }
                                        h3 { color: #555; }
                                        .order-details { background: #f4f4f4; padding: 15px; border-radius: 5px; }
                                        .instructions { background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0; }
                                        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <h2>Mulțumim pentru achiziție!</h2>
                                        <p>Bună ${userName || "Client"},</p>
                                        <p>Plata dvs. a fost procesată cu succes. Găsiți atașate biletele pentru meciul FC Hermannstadt${
                                          awayTeam ? " vs " + awayTeam : ""
                                        }.</p>
                                        
                                        <div class="order-details">
                                            <h3>Detalii comandă:</h3>
                                            <ul>
                                                <li><strong>ID Comandă:</strong> ${orderId}</li>
                                                <li><strong>Data plății:</strong> ${new Date().toLocaleString(
                                                  "ro-RO"
                                                )}</li>
                                                <li><strong>Total plătit:</strong> ${totalAmount} RON</li>
                                                <li><strong>Număr bilete:</strong> ${items.reduce(
                                                  (sum, item) =>
                                                    sum + item.numarBilete,
                                                  0
                                                )}</li>
                                            </ul>
                                        </div>
                                        
                                        <div class="instructions">
                                            <h3>Instrucțiuni importante:</h3>
                                            <ul>
                                                <li>Prezentați biletul în format fizic sau electronic la intrare</li>
                                                <li>Ajungeți cu cel puțin 30 de minute înainte de începerea meciului</li>
                                                <li>Nu uitați să aduceți un act de identitate</li>
                                                <li>Respectați locurile indicate pe bilete</li>
                                            </ul>
                                        </div>
                                        
                                        <div class="footer">
                                            <p>Pentru orice întrebări, contactați-ne la: support@gamedaysibiu.ro</p>
                                            <p>Vă dorim o experiență plăcută!</p>
                                            <p><strong>Echipa GameDay Sibiu</strong></p>
                                        </div>
                                    </div>
                                </body>
                                </html>
                            `,
              attachments: tickets,
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error("EROARE TRIMITERE EMAIL:", error);
                console.error("Detalii eroare:", error.message);
                console.error("Stack:", error.stack);
              } else {
                console.log("EMAIL TRIMIS CU SUCCES!");
                console.log("Message ID:", info.messageId);
                console.log("Response:", info.response);
              }
            });
          }

          // Răspuns succes
          console.log("Trimitere răspuns succes către client");
          res.json({
            success: true,
            orderId: orderId,
            paymentId: paymentId,
            message:
              "Plată procesată cu succes! Biletele au fost trimise pe email.",
          });
        } catch (processError) {
          console.error("Eroare procesare bilete:", processError);
          res.status(500).json({
            success: false,
            error: "Eroare la procesarea biletelor",
          });
        }
      }
    );
  } catch (error) {
    console.error("Eroare generală:", error);
    res.status(500).json({
      success: false,
      error: "Eroare la procesarea plății: " + error.message,
    });
  }
});

// Endpoint de test pentru verificare
app.get("/api/test-payment", (req, res) => {
  res.json({
    message: "Endpoint-ul de plată este disponibil",
    endpoint: "/api/process-payment",
    method: "POST",
  });
});
app.listen(PORT, () => {
  console.log(`Serverul rulează la http://localhost:${PORT}`);
});
