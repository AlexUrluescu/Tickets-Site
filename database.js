
import mysql from "mysql2";
import express from "express";
import cors from "cors";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import crypto from "crypto";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();

const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "llama3.2";

app.use(cors());
app.use(express.json());
const upload = multer({ dest: "uploads/" });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  dateStrings: true,
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

   
      doc.rect(0, 0, doc.page.width, 80).fill("#f0f0f0");

      doc
        .fillColor("#000000")
        .fontSize(20)
        .text(
          "Ion Oblemenco - Tickets Service - FC Hermannstadt vs " +
            (ticketData.awayTeam || "Echipa Oaspete"),
          50,
          25,
          {
            align: "center",
          },
        );

      doc
        .fontSize(12)
        .text(
          `Data: ${ticketData.matchDate}, Ora: ${ticketData.matchTime}`,
          50,
          55,
        )
        .text("Stadion Municipal, Sibiu", 50, 70);

     
      doc.moveTo(50, 100).lineTo(550, 100).stroke();

      
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

      
      doc.fontSize(14).text("DETALII BILET", 200, 120, { underline: true });

      doc
        .fontSize(12)
        .text(`Sector: ${ticketData.sector}`, 200, 150)
        .text(`Tribuna: ${ticketData.tribuna}`, 200, 170)
        .text(`Rand: ${ticketData.row}`, 200, 190)
        .text(`Locuri: ${ticketData.seats}`, 200, 210)
        .text(`Numar bilete: ${ticketData.numberOfTickets}`, 200, 230)
        .text(`Pret total: ${ticketData.totalPrice} RON`, 200, 250);

      
      doc.fontSize(14).text("INVITATIE", 400, 120, { underline: true });

      doc.fontSize(16).text(ticketData.invitationCode, 400, 150);

      
      doc.moveTo(50, 280).lineTo(550, 280).stroke();

      
      doc.fontSize(14).text("DETINATOR", 50, 300, { underline: true });

      doc
        .fontSize(12)
        .text(`Nume: ${ticketData.userName}`, 50, 330)
        .text(`Email: ${ticketData.userEmail}`, 50, 350);

      
      doc
        .fontSize(14)
        .text("INFORMATII IMPORTANTE", 50, 410, { underline: true });

      doc
        .fontSize(10)
        .text(
          "• Biletul trebuie prezentat la poarta si este valabil pentru o singura persoana",
          50,
          440,
        )
        .text(
          "• Accesul se face doar prin intrarile indicate pe bilet",
          50,
          455,
        )
        .text("• Copiii sub 14 ani trebuie sa prezinte bilet valabil", 50, 470)
        .text(
          "• Acest bilet este valabil numai insotit de un act de identitate",
          50,
          485,
        )
        .text("• Falsificarea biletelor se pedepseste conform legii", 50, 500)
        .text(
          "• Pe stadion, spectatorilor le este INTERZIS sa intre cu:",
          50,
          515,
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

      
      doc
        .fontSize(10)
        .fillColor("#666666")
        .text(`Organizator: FC Hermannstadt, RO34826156`, 50, 700)
        .text(`Contact ionoblemencoticketsservice.ro: +40755179942`, 50, 715)
        .text(`© 2025 www.ionoblemenco.ro`, 50, 730, { align: "center" });

      
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

app.post("/upload-doc", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    console.log(`Processing file: ${req.file.originalname}`);

    const loader = new DocxLoader(req.file.path);
    const docs = await loader.load();


    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(docs);


  
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    res.json({
      success: true,
      message: "File processed and embeddings stored!",
      chunks: splitDocs.length,
    });
  } catch (error) {
    console.error("Error processing document:", error);
    res.status(500).send("Error processing file");
  }
});

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
        const matchId = results[0]?.matchId || null;

        res.json({ awayTeamName, awayTeamId, matchId }); 
      }
    },
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
          ? (typeof matchDate === 'string' ? matchDate.split(' ')[0] : matchDate.toISOString().split("T")[0])
          : "Data nu a fost găsită";
        res.json({ matchDate: formattedDate });
      }
    },
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
    },
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
    },
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

      
      const [, ...restMatches] = results;

      const formattedMatches = restMatches.map((match) => ({
        id: match.id,
        matchDate: typeof match.data === 'string' ? match.data.split(' ')[0] : new Date(match.data).toISOString().split("T")[0],
        matchTime: match.ora,
        awayTeamName: match.awayTeamName,
        awayTeamLogo: match.awayTeamLogo,
      }));

      res.json({ matches: formattedMatches });
    },
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
    },
  );
});
app.post("/api/check-password", (req, res) => {
  const { email } = req.body;
  pool.query(
    `SELECT password, role FROM users WHERE email = ?`,
    [email],
    (err, results) => {
      if (err) {
        console.error("Eroare la verificarea parolei:", err);
        return res.status(500).json({ error: "Eroare la server" });
      } else {
        res.json({ password: results[0]?.password || null, role: results[0]?.role || 'user' });
      }
    },
  );
});
app.post("/api/get-name", (req, res) => {
  const { email } = req.body;
  pool.query(
    `SELECT nume AS numeUser, role FROM users WHERE email = ?`,
    [email],
    (err, results) => {
      if (err) {
        console.error("Eroare la preluarea numelui", err);
        return res.status(500).json({ error: "Eroare la server" });
      } else {
        res.json({ numeUser: results[0]?.numeUser || null, role: results[0]?.role || 'user' });
      }
    },
  );
});
app.post("/api/add-user", (req, res) => {
  const { username, email, password } = req.body;

  pool.query(
    `INSERT INTO users (email,password,nume,role) VALUES (?,?,?,?)`,
    [email, password, username, 'user'],
    (err, results) => {
      if (err) {
        console.error("Eroare la adaugarea username-ului", err);
        return res.status(500).json({ error: "Eroare la server" });
      }
      res.status(201).json({ message: "User adăugat cu succes" });
    },
  );
});
app.post("/api/populate-bilete", (req, res) => {
  pool.query("SELECT id FROM meciuri", (err, matches) => {
    if (err) {
      console.error("Eroare la preluarea meciurilor:", err);
      return res.status(500).json({ error: "Eroare la preluarea meciurilor" });
    }

    pool.query(`TRUNCATE TABLE bilete`, (err) => {
      if (err) {
        console.error("Eroare la ștergere:", err);
        return res.status(500).json({ error: "Eroare la ștergere" });
      }

      const zone = [
    
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
          randuri: [14, 24],
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
          randuri: [14, 24],
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
          randuri: [14, 24],
          locuriPerRand: 53,
          pret: 50.0,
        },

    
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
    });
  });
});


function generateBileteForMatch(matchId) {
  return new Promise((resolve, reject) => {
    const zone = [
    
      { zona: "TRIBUNA 1", sector: "A1", randuri: [1, 6], locuriPerRand: 69, pret: 50.0 },
      { zona: "TRIBUNA 1", sector: "A1", randuri: [7, 11], locuriPerRand: 63, pret: 50.0 },
      { zona: "TRIBUNA 1", sector: "A1", randuri: [12, 17], locuriPerRand: 12, pret: 50.0 },
      { zona: "TRIBUNA 1", sector: "A2", randuri: [1, 4], locuriPerRand: 52, pret: 50.0 },
      { zona: "TRIBUNA 1", sector: "A2", randuri: [5, 6], locuriPerRand: 64, pret: 50.0 },
      { zona: "TRIBUNA 1", sector: "A2", randuri: [7, 11], locuriPerRand: 54, pret: 50.0 },
      { zona: "TRIBUNA 1", sector: "A3", randuri: [1, 6], locuriPerRand: 69, pret: 50.0 },
      { zona: "TRIBUNA 1", sector: "A3", randuri: [7, 11], locuriPerRand: 58, pret: 50.0 },
      { zona: "TRIBUNA 1", sector: "A3", randuri: [12, 17], locuriPerRand: 12, pret: 50.0 },
      { zona: "TRIBUNA 1", sector: "VIP", randuri: [1, 6], locuriPerRand: 66, pret: 100.0 },
      // TRIBUNA 2
      { zona: "TRIBUNA 2", sector: "C1", randuri: [1, 10], locuriPerRand: 54, pret: 50.0 },
      { zona: "TRIBUNA 2", sector: "C1", randuri: [11, 13], locuriPerRand: 44, pret: 50.0 },
      { zona: "TRIBUNA 2", sector: "C1", randuri: [14, 24], locuriPerRand: 53, pret: 50.0 },
      { zona: "TRIBUNA 2", sector: "C2", randuri: [1, 10], locuriPerRand: 54, pret: 50.0 },
      { zona: "TRIBUNA 2", sector: "C2", randuri: [11, 13], locuriPerRand: 44, pret: 50.0 },
      { zona: "TRIBUNA 2", sector: "C2", randuri: [14, 24], locuriPerRand: 53, pret: 50.0 },
      { zona: "TRIBUNA 2", sector: "C3", randuri: [1, 10], locuriPerRand: 54, pret: 50.0 },
      { zona: "TRIBUNA 2", sector: "C3", randuri: [11, 13], locuriPerRand: 44, pret: 50.0 },
      { zona: "TRIBUNA 2", sector: "C3", randuri: [14, 24], locuriPerRand: 53, pret: 50.0 },
   
      ...["D1", "D2", "D3", "D4", "D5"].flatMap((sector) => [
        { zona: "PELUZA NORD", sector, randuri: [7, 8], locuriPerRand: 41, pret: 30.0 },
        { zona: "PELUZA NORD", sector, randuri: [9, 9], locuriPerRand: 42, pret: 30.0 },
        { zona: "PELUZA NORD", sector, randuri: [10, 10], locuriPerRand: 45, pret: 30.0 },
        { zona: "PELUZA NORD", sector, randuri: [11, 13], locuriPerRand: 52, pret: 30.0 },
        { zona: "PELUZA NORD", sector, randuri: [14, 19], locuriPerRand: 56, pret: 30.0 },
      ]),
    
      ...["B1", "B2", "B3"].flatMap((sector) => [
        { zona: "PELUZA SUD", sector, randuri: [7, 8], locuriPerRand: 41, pret: 30.0 },
        { zona: "PELUZA SUD", sector, randuri: [9, 9], locuriPerRand: 42, pret: 30.0 },
        { zona: "PELUZA SUD", sector, randuri: [10, 10], locuriPerRand: 45, pret: 30.0 },
        { zona: "PELUZA SUD", sector, randuri: [11, 13], locuriPerRand: 52, pret: 30.0 },
        { zona: "PELUZA SUD", sector, randuri: [14, 19], locuriPerRand: 56, pret: 30.0 },
      ]),
    ];

    pool.query("DELETE FROM bilete WHERE match_id = ?", [matchId], (err) => {
      if (err) {
        console.error("[GenerateBilete] Eroare la ștergere:", err);
        return reject(err);
      }

      const bilete = [];
      for (const z of zone) {
        for (let rand = z.randuri[0]; rand <= z.randuri[1]; rand++) {
          for (let loc = 1; loc <= z.locuriPerRand; loc++) {
            bilete.push([z.zona, z.sector, rand, loc, "disponibil", z.pret, matchId]);
          }
        }
      }

      pool.query(
        `INSERT INTO bilete (zona, sector, rand, loc, status, pret, match_id) VALUES ?`,
        [bilete],
        (err, result) => {
          if (err) {
            console.error("[GenerateBilete] Eroare la inserare:", err);
            return reject(err);
          }
          console.log(`[GenerateBilete] ✅ ${result.affectedRows} bilete generate pentru meciul ${matchId}`);
          resolve(result.affectedRows);
        }
      );
    });
  });
}

app.post("/api/populate-bilete-match", async (req, res) => {
  const { matchId } = req.body;
  if (!matchId) {
    return res.status(400).json({ error: "matchId este obligatoriu" });
  }
  try {
    const inserate = await generateBileteForMatch(Number(matchId));
    res.status(200).json({ message: "Biletele au fost generate cu succes", inserate, matchId });
  } catch (err) {
    res.status(500).json({ error: "Eroare la generare bilete" });
  }
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

      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");

      res.json({ disponibile, pret });
    },
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

   
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");

      res.json(results);
    },
  );
});


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
    seats,
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
        `Actualizare loc pentru meciul ${matchId}: Sector ${sector}, Rand ${rand}, Loc ${loc}`,
      );

      pool.query(
        'UPDATE bilete SET status = "rezervat" WHERE sector = ? AND rand = ? AND loc = ? AND match_id = ?',
        [sector, rand, loc, matchId],
        (err, result) => {
          if (err) {
            console.error("Eroare la actualizarea locului:", err);
            reject(err);
          } else {
            console.log(
              `Actualizat cu succes pentru meciul ${matchId}: Sector ${sector}, Rand ${rand}, Loc ${loc}`,
            );
            resolve(result);
          }
        },
      );
    });
  });

  Promise.all(updatePromises)
    .then(() => {
      console.log(
        "Toate locurile au fost actualizate cu succes pentru meciul:",
        matchId,
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
    },
  );
});

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

    const orderId = "ORD-" + Date.now();
    const paymentId = "PAY-" + Date.now();

    console.log("IDs generate:", { orderId, paymentId });

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
       
          const tickets = [];

     
          for (const item of items) {
            const ticketId = generateTicketCode();
            const invitationCode = generateInvitationNumber();

            console.log(`Procesare bilet: ${ticketId}`);

          
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
                },
              );
            });

            if (item.selectedSeatsKeys) {
              for (const seatKey of item.selectedSeatsKeys) {
                const [rand, loc] = seatKey.split("-");
                await new Promise((resolve) => {
                  pool.query(
                    `UPDATE bilete 
                 SET status = 'rezervat' 
                 WHERE sector = ? AND rand = ? AND loc = ? AND match_id = ?`,
                    [item.sector, rand, loc, matchId], 
                    (err, result) => {
                      if (err) {
                        console.error("Eroare la actualizarea locului:", err);
                      } else {
                        console.log(
                          `Loc actualizat pentru meciul ${matchId}: Sector ${item.sector}, Rand ${rand}, Loc ${loc}`,
                        );
                      }
                      resolve();
                    },
                  );
                });
              }
            }


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

          if (tickets.length > 0) {
            console.log(`Pregătire trimitere email către: ${userEmail}`);

            const mailOptions = {
              from: `"Ion Oblemenco - Tickets Service" <${process.env.EMAIL_USER}>`,
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
                                        <p>Plata dvs. a fost procesată cu succes. Găsiți atașate biletele pentru meciul Universitatea Craiova${
                                          awayTeam ? " vs " + awayTeam : ""
                                        }.</p>
                                        
                                        <div class="order-details">
                                            <h3>Detalii comandă:</h3>
                                            <ul>
                                                <li><strong>ID Comandă:</strong> ${orderId}</li>
                                                <li><strong>Data plății:</strong> ${new Date().toLocaleString(
                                                  "ro-RO",
                                                )}</li>
                                                <li><strong>Total plătit:</strong> ${totalAmount} RON</li>
                                                <li><strong>Număr bilete:</strong> ${items.reduce(
                                                  (sum, item) =>
                                                    sum + item.numarBilete,
                                                  0,
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
                                            <p>Pentru orice întrebări, contactați-ne la: support@ionoblemencoticketsservice.ro</p>
                                            <p>Vă dorim o experiență plăcută!</p>
                                            <p><strong>Echipa Ion Oblemenco - Tickets Service</strong></p>
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
      },
    );
  } catch (error) {
    console.error("Eroare generală:", error);
    res.status(500).json({
      success: false,
      error: "Eroare la procesarea plății: " + error.message,
    });
  }
});


app.get("/api/test-payment", (req, res) => {
  res.json({
    message: "Endpoint-ul de plată este disponibil",
    endpoint: "/api/process-payment",
    method: "POST",
  });
});


const checkAdmin = (req, res, next) => {
  const email = req.query.email || req.body.email;
  if (!email) {
    return res.status(401).json({ error: "Email lipsă" });
  }
  pool.query(
    "SELECT role FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ error: "Utilizator negăsit" });
      }
      if (results[0].role !== "admin") {
        return res.status(403).json({ error: "Acces interzis - nu ești admin" });
      }
      next();
    }
  );
};


app.get("/api/user/bilete", (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email lipsă" });
  }

  const query = `
    SELECT 
      pt.ticket_id, pt.match_id, pt.sector, pt.tribuna, pt.rand, pt.locuri, pt.pret, pt.invitation_code,
      o.order_id, o.user_email, o.status,
      m.data AS match_date, m.ora AS match_time,
      e.nume AS echipa_oaspete, e.logo_url AS echipa_oaspete_logo
    FROM purchased_tickets pt
    JOIN orders o ON pt.order_id = o.order_id
    JOIN meciuri m ON pt.match_id = m.id
    JOIN echipe e ON m.echipa_deplasare_id = e.id
    WHERE o.user_email = ? AND o.status = 'completed'
    ORDER BY m.data DESC, m.ora DESC
  `;

  pool.query(query, [email], (err, results) => {
    if (err) {
      console.error("Eroare la preluarea biletelor:", err);
      return res.status(500).json({ error: "Eroare la preluarea biletelor" });
    }
    res.json(results);
  });
});


app.get("/api/admin/stats", checkAdmin, (req, res) => {
  const queries = {
    totalBilete: "SELECT COUNT(*) AS total FROM purchased_tickets",
    totalVenituri: "SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status = 'completed'",
    totalMeciuri: `SELECT COUNT(*) AS total FROM meciuri WHERE data >= CURDATE()`,
    totalUseri: "SELECT COUNT(*) AS total FROM users",
  };

  const results = {};
  let completed = 0;
  const keys = Object.keys(queries);

  keys.forEach((key) => {
    pool.query(queries[key], (err, rows) => {
      if (err) {
        console.error(`Eroare la ${key}:`, err);
        results[key] = 0;
      } else {
        results[key] = rows[0]?.total || 0;
      }
      completed++;
      if (completed === keys.length) {
        res.json(results);
      }
    });
  });
});


app.get("/api/admin/sold-tickets", checkAdmin, (req, res) => {
  const matchId = req.query.matchId;
  let query = `
    SELECT pt.ticket_id, pt.sector, pt.tribuna, pt.rand, pt.locuri, 
           pt.numar_bilete, pt.pret, pt.invitation_code,
           o.order_id, o.user_email, o.user_name, o.total_amount, o.created_at,
           e.nume AS awayTeamName, m.data AS matchDate, m.ora AS matchTime
    FROM purchased_tickets pt
    JOIN orders o ON pt.order_id = o.order_id
    LEFT JOIN meciuri m ON pt.match_id = m.id
    LEFT JOIN echipe e ON m.echipa_deplasare_id = e.id
  `;
  const params = [];

  if (matchId) {
    query += " WHERE pt.match_id = ?";
    params.push(matchId);
  }

  query += " ORDER BY o.created_at DESC";

  pool.query(query, params, (err, results) => {
    if (err) {
      console.error("Eroare la preluarea biletelor vândute:", err);
      return res.status(500).json({ error: "Eroare server" });
    }
    res.json({ tickets: results });
  });
});


app.get("/api/admin/teams", checkAdmin, (req, res) => {
  pool.query("SELECT id, nume, logo_url FROM echipe ORDER BY nume ASC", (err, results) => {
    if (err) {
      console.error("Eroare la preluarea echipelor:", err);
      return res.status(500).json({ error: "Eroare server" });
    }
    res.json({ teams: results });
  });
});


app.post("/api/admin/add-team", checkAdmin, (req, res) => {
  const { nume, logo_url } = req.body;
  if (!nume) {
    return res.status(400).json({ error: "Numele echipei este obligatoriu" });
  }
  pool.query(
    "INSERT INTO echipe (nume, logo_url) VALUES (?, ?)",
    [nume, logo_url || null],
    (err, result) => {
      if (err) {
        console.error("Eroare la adăugarea echipei:", err);
        return res.status(500).json({ error: "Eroare server" });
      }
      res.status(201).json({ message: "Echipă adăugată cu succes", id: result.insertId });
    }
  );
});


app.get("/api/admin/matches", checkAdmin, (req, res) => {
  pool.query(
    `SELECT m.id, m.data, m.ora, e.nume AS awayTeamName, e.logo_url AS awayTeamLogo
     FROM meciuri m
     JOIN echipe e ON m.echipa_deplasare_id = e.id
     ORDER BY m.data DESC`,
    (err, results) => {
      if (err) {
        console.error("Eroare la preluarea meciurilor:", err);
        return res.status(500).json({ error: "Eroare server" });
      }
      const formattedMatches = results.map((match) => ({
        id: match.id,
        matchDate: typeof match.data === 'string' ? match.data.split(' ')[0] : new Date(match.data).toISOString().split("T")[0],
        matchTime: match.ora,
        awayTeamName: match.awayTeamName,
        awayTeamLogo: match.awayTeamLogo,
      }));
      res.json({ matches: formattedMatches });
    }
  );
});


app.post("/api/admin/add-match", checkAdmin, async (req, res) => {
  const { data, ora, echipa_deplasare_id } = req.body;
  if (!data || !ora || !echipa_deplasare_id) {
    return res.status(400).json({ error: "Toate câmpurile sunt obligatorii (data, ora, echipa_deplasare_id)" });
  }
  pool.query(
    "INSERT INTO meciuri (data, ora, echipa_deplasare_id) VALUES (?, ?, ?)",
    [data, ora, echipa_deplasare_id],
    async (err, result) => {
      if (err) {
        console.error("Eroare la adăugarea meciului:", err);
        return res.status(500).json({ error: "Eroare server" });
      }
      const matchId = Number(result.insertId);
      console.log(`[Admin] Meci adăugat cu ID: ${matchId}. Se generează biletele...`);
      try {
        const inserate = await generateBileteForMatch(matchId);
        console.log(`[Admin] ✅ Bilete generate automat: ${inserate}`);
        res.status(201).json({ message: "Meci adăugat și bilete generate cu succes", id: matchId });
      } catch (genErr) {
        console.error("[Admin] ❌ Eroare la generare automată bilete:", genErr);
        res.status(201).json({ message: "Meci adăugat dar eroare la generarea biletelor", id: matchId });
      }
    }
  );
});

// Admin - Editează meci existent
app.put("/api/admin/edit-match", checkAdmin, (req, res) => {
  const { id, data, ora, echipa_deplasare_id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "ID-ul meciului este obligatoriu" });
  }
  if (!data || !ora || !echipa_deplasare_id) {
    return res.status(400).json({ error: "Toate câmpurile sunt obligatorii (data, ora, echipa_deplasare_id)" });
  }
  pool.query(
    "UPDATE meciuri SET data = ?, ora = ?, echipa_deplasare_id = ? WHERE id = ?",
    [data, ora, echipa_deplasare_id, id],
    (err, result) => {
      if (err) {
        console.error("Eroare la editarea meciului:", err);
        return res.status(500).json({ error: "Eroare server" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Meciul nu a fost găsit" });
      }
      console.log(`[Admin] ✅ Meci ${id} actualizat cu succes`);
      res.json({ message: "Meci actualizat cu succes", id });
    }
  );
});


function dbQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Mesajul este gol" });
    }

    console.log("[AI Chat] Întrebare primită:", message);

    const currentDate = new Date().toISOString().split("T")[0];

    const matches = await dbQuery(
      `SELECT m.id, m.data, m.ora, e.nume AS awayTeamName
       FROM meciuri m
       JOIN echipe e ON m.echipa_deplasare_id = e.id
       WHERE m.data >= ?
       ORDER BY m.data ASC`,
      [currentDate]
    );

    let sectorInfo = [];
    if (matches.length > 0) {
      sectorInfo = await dbQuery(
        `SELECT zona, sector, COUNT(*) AS locuri_disponibile, MAX(pret) AS pret
         FROM bilete
         WHERE match_id = ? AND status = 'disponibil'
         GROUP BY zona, sector
         ORDER BY zona, sector`,
        [matches[0].id]
      );
    }

    const totalAvailable = await dbQuery(
      `SELECT m.id AS match_id, e.nume AS awayTeamName, m.data, m.ora,
              COUNT(b.id) AS locuri_disponibile
       FROM meciuri m
       JOIN echipe e ON m.echipa_deplasare_id = e.id
       LEFT JOIN bilete b ON b.match_id = m.id AND b.status = 'disponibil'
       WHERE m.data >= ?
       GROUP BY m.id, e.nume, m.data, m.ora
       ORDER BY m.data ASC`,
      [currentDate]
    );

    const matchesContext = matches.length > 0
      ? matches.map((m) => {
          const dateStr = new Date(m.data).toLocaleDateString("ro-RO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          return `- Universitatea Craiova vs ${m.awayTeamName} | Data: ${dateStr} | Ora: ${m.ora}`;
        }).join("\n")
      : "Nu sunt meciuri programate în viitorul apropiat.";

    const sectorContext = sectorInfo.length > 0
      ? sectorInfo.map((s) =>
          `- ${s.zona}, Sector ${s.sector}: ${s.locuri_disponibile} locuri disponibile, Preț: ${s.pret} RON`
        ).join("\n")
      : "Nu sunt informații disponibile despre locuri.";

    const availabilityContext = totalAvailable.length > 0
      ? totalAvailable.map((t) => {
          const dateStr = new Date(t.data).toLocaleDateString("ro-RO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          return `- vs ${t.awayTeamName} (${dateStr}): ${t.locuri_disponibile} locuri disponibile`;
        }).join("\n")
      : "";

    const systemPrompt = `Ești asistentul virtual al stadionului "Ion Oblemenco" din Craiova, pentru echipa Universitatea Craiova.

REGULI STRICTE:
1. Răspunde STRICT și EXCLUSIV la mesajul utilizatorului. Nu oferi detalii nesolicitate!
2. Dacă utilizatorul te salută (ex: "Salut", "Bună", "Hello"), răspunde-i DOAR cu un salut scurt și întreabă-l cum îl poți ajuta. NU înșira toată lista de meciuri sau prețuri!
3. Datele de mai jos reprezintă un CONTEXT SECRET acordat ție. Folosește aceste date DOAR pentru a găsi răspunsul specific la ceea ce a întrebat utilizatorul. Nu le printa ca o listă.
4. Răspunde scurt, la obiect, prietenos și OBLIGATORIU în limba română.
5. Fără formatare (fără bold, italic, stele etc.) - folosește exclusiv text simplu.

=== CONTEXT SECRET ===
[MECIURI PROGRAMATE]
${matchesContext}

[DISPONIBILITATE LOCURI PENTRU URMĂTORUL MECI]
${sectorContext}

[DISPONIBILITATE GENERALĂ]
${availabilityContext}

[INFORMAȚII STADION]
- Nume: Stadionul "Ion Oblemenco", Craiova
- Zone: TRIBUNA 1 (A1, A2, A3, VIP), TRIBUNA 2 (C1, C2, C3), PELUZA NORD (D1-D5), PELUZA SUD (B1-B3)
- Prețuri: Trib. 1/2 = 50 RON, VIP = 100 RON, Peluza N/S = 30 RON
- Achiziție: Biletele se pot cumpăra de pe acest site.

Mesajul utilizatorului: "${message}"`;

console.log("Se trimite cererea către Ollama...");

    const ollamaResponse = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: systemPrompt,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
        throw new Error(`Ollama API error: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    const aiText = data.response;

    console.log("[AI Chat] Răspuns generat cu succes de Ollama");

    res.json({ response: aiText });
  } catch (error) {
    console.error("[AI Chat] Eroare:", error);
    res.status(500).json({
      error: "Eroare la generarea răspunsului",
      response:
        "Îmi pare rău, am întâmpinat o problemă tehnică. Te rog să încerci din nou sau să contactezi casa de bilete pentru asistență.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Serverul rulează la http://localhost:${PORT}`);
});
