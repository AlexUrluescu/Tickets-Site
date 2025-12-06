
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurare Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // sau alt serviciu SMTP
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});


function generateTicketCode() {
    return 'TKT' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Funcție pentru generare număr invitație
function generateInvitationNumber() {
    return 'POHR' + Math.floor(Math.random() * 90000 + 10000);
}

// Funcție pentru creare PDF bilet
async function createTicketPDF(ticketData) {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // Header cu logo-uri
            doc.rect(0, 0, doc.page.width, 80).fill('#f0f0f0');

            // Titlu principal
            doc.fillColor('#000000')
                .fontSize(20)
                .text('eBilet - Superliga - FC Hermannstadt vs ' + ticketData.awayTeam, 50, 25, {
                    align: 'center'
                });

            // Informații meci
            doc.fontSize(12)
                .text(`Data: ${ticketData.matchDate}, Ora: ${ticketData.matchTime}`, 50, 55)
                .text('Stadion Municipal, Sibiu', 50, 70);

            // Separator
            doc.moveTo(50, 100)
                .lineTo(550, 100)
                .stroke();

            // QR Code pentru bilet
            const qrCodeData = {
                ticketId: ticketData.ticketId,
                sector: ticketData.sector,
                row: ticketData.row,
                seats: ticketData.seats
            };

            const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrCodeData));
            const qrBuffer = Buffer.from(qrCodeImage.split(',')[1], 'base64');
            doc.image(qrBuffer, 50, 120, { width: 100 });

            // Informații bilet
            doc.fontSize(14)
                .text('DETALII BILET', 200, 120, { underline: true });

            doc.fontSize(12)
                .text(`Sector: ${ticketData.sector}`, 200, 150)
                .text(`Tribuna: ${ticketData.tribuna}`, 200, 170)
                .text(`Rând: ${ticketData.row}`, 200, 190)
                .text(`Locuri: ${ticketData.seats}`, 200, 210)
                .text(`Număr bilete: ${ticketData.numberOfTickets}`, 200, 230)
                .text(`Preț total: ${ticketData.totalPrice} RON`, 200, 250);

            // Cod invitație
            doc.fontSize(14)
                .text('INVITAȚIE', 400, 120, { underline: true });

            doc.fontSize(16)
                .text(ticketData.invitationCode, 400, 150);

            // Separator
            doc.moveTo(50, 280)
                .lineTo(550, 280)
                .stroke();

            // Informații deținător
            doc.fontSize(14)
                .text('DEȚINĂTOR', 50, 300, { underline: true });

            doc.fontSize(12)
                .text(`Nume: ${ticketData.userName}`, 50, 330)
                .text(`Email: ${ticketData.userEmail}`, 50, 350)
                .text(`Domiciliu: Sibiu`, 50, 370);

            // Instrucțiuni și informații importante
            doc.fontSize(14)
                .text('INFORMAȚII IMPORTANTE', 50, 410, { underline: true });

            doc.fontSize(10)
                .text('• Biletul trebuie prezentat la poartă și este valabil pentru o singură persoană', 50, 440)
                .text('• Accesul se face doar prin intrările indicate pe bilet', 50, 455)
                .text('• Copiii sub 14 ani trebuie să prezinte bilet valabil', 50, 470)
                .text('• Acest bilet este valabil numai însoțit de un act de identitate', 50, 485)
                .text('• Falsificarea biletelor se pedepsește conform legii', 50, 500)
                .text('• Accesul suporterilor se face doar prin intrările indicate pe bilet', 50, 515)
                .text('• Pe stadion, spectatorilor le este INTERZIS să intre cu următoarele obiecte:', 50, 530);

            const restrictions = [
                'Cu materiale pirotehnice de orice natură',
                'Sub influența alcoolului',
                'Cu arme albe (cuțite, șurubelnițe, metale ascuțite, lacăte, etc.)',
                'Cu monede, brichete, umbrele, mânunchiuri de chei, mai multe brelocuri',
                'Cu steaguri și bețe din plastic cu diametrul mai mare de 16 mm',
                'Cu materiale de propagandă care incită la denigrarea țărilor, xenofobie'
            ];

            let yPos = 550;
            restrictions.forEach(restriction => {
                doc.text(`  - ${restriction}`, 60, yPos);
                yPos += 15;
            });

            // Footer
            doc.fontSize(10)
                .fillColor('#666666')
                .text(`Organizator: FC Hermannstadt, RO34826156`, 50, 700)
                .text(`Contact Bilete.ro: +4072 776 66 31`, 50, 715)
                .text(`© 2025 www.bilete.ro`, 50, 730, { align: 'center' });

            // Cod de bare pentru scanare rapidă
            doc.rect(350, 650, 200, 60).stroke();
            doc.fontSize(8)
                .fillColor('#000000')
                .text(ticketData.ticketId, 355, 680, { align: 'center', width: 190 });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}


// Endpoint pentru procesare plată și generare bilete
app.post('/api/process-payment', async (req, res) => {
    try {
        const {
            cardName,
            cardNumber,
            expirationDate,
            cvc,
            userEmail,
            userName,
            items,
            totalAmount
        } = req.body;

        // Validare date card (în producție, folosește un serviciu de plăți real)
        if (!cardName || !cardNumber || !expirationDate || !cvc) {
            return res.status(400).json({ error: 'Date card incomplete' });
        }

        // Simulare procesare plată
        const paymentId = 'PAY-' + crypto.randomBytes(8).toString('hex').toUpperCase();
        const orderId = 'ORD-' + crypto.randomBytes(6).toString('hex').toUpperCase();

        // Salvare comandă în baza de date
        pool.query(
            `INSERT INTO orders (order_id, user_email, user_name, total_amount, payment_id, status) 
             VALUES (?, ?, ?, ?, ?, 'completed')`,
            [orderId, userEmail, userName, totalAmount, paymentId],
            async (err, orderResult) => {
                if (err) {
                    console.error('Eroare salvare comandă:', err);
                    return res.status(500).json({ error: 'Eroare procesare comandă' });
                }

                // Generare bilete PDF pentru fiecare item
                const tickets = [];

                for (const item of items) {
                    const ticketId = generateTicketCode();
                    const invitationCode = generateInvitationNumber();

                    // Salvare bilet în baza de date
                    await new Promise((resolve, reject) => {
                        pool.query(
                            `INSERT INTO purchased_tickets 
                             (ticket_id, order_id, sector, tribuna, rand, locuri, numar_bilete, pret, invitation_code) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                ticketId,
                                orderId,
                                item.sector,
                                item.tribuna,
                                item.randuriSiLocuri ? JSON.stringify(item.randuriSiLocuri) : item.rand,
                                item.randuriSiLocuri ?
                                    item.randuriSiLocuri.map(r => r.locuri).join(', ') :
                                    item.numar_locuri,
                                item.numarBilete,
                                item.pret,
                                invitationCode
                            ],
                            (err) => {
                                if (err) reject(err);
                                else resolve();
                            }
                        );
                    });

                    // Actualizare status locuri în baza de date
                    if (item.selectedSeatsKeys) {
                        for (const seatKey of item.selectedSeatsKeys) {
                            const [rand, loc] = seatKey.split('-');
                            await new Promise((resolve, reject) => {
                                pool.query(
                                    `UPDATE bilete 
                                     SET status = 'rezervat', order_id = ? 
                                     WHERE sector = ? AND rand = ? AND loc = ?`,
                                    [orderId, item.sector, rand, loc],
                                    (err) => {
                                        if (err) reject(err);
                                        else resolve();
                                    }
                                );
                            });
                        }
                    }

                    // Generare PDF pentru bilet
                    const ticketData = {
                        ticketId,
                        invitationCode,
                        awayTeam: req.body.awayTeam || 'Echipa Oaspete',
                        matchDate: req.body.matchDate || new Date().toLocaleDateString('ro-RO'),
                        matchTime: req.body.matchTime || '17:30',
                        sector: item.sector,
                        tribuna: item.tribuna,
                        row: item.randuriSiLocuri ?
                            item.randuriSiLocuri.map(r => r.rand).join(', ') :
                            item.rand,
                        seats: item.randuriSiLocuri ?
                            item.randuriSiLocuri.map(r => r.locuri).join(', ') :
                            item.numar_locuri,
                        numberOfTickets: item.numarBilete,
                        totalPrice: item.pret,
                        userName: userName || 'Client',
                        userEmail: userEmail
                    };

                    const pdfBuffer = await createTicketPDF(ticketData);
                    tickets.push({
                        filename: `bilet-${ticketId}.pdf`,
                        content: pdfBuffer
                    });
                }

                // Trimitere email cu biletele atașate
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: userEmail,
                    subject: `Biletele dvs. pentru FC Hermannstadt - Comanda ${orderId}`,
                    html: `
                        <h2>Mulțumim pentru achiziție!</h2>
                        <p>Bună ${userName},</p>
                        <p>Plata dvs. a fost procesată cu succes. Găsiți atașate biletele pentru meciul FC Hermannstadt.</p>
                        
                        <h3>Detalii comandă:</h3>
                        <ul>
                            <li>ID Comandă: ${orderId}</li>
                            <li>Data plății: ${new Date().toLocaleString('ro-RO')}</li>
                            <li>Total plătit: ${totalAmount} RON</li>
                        </ul>
                        
                        <h3>Instrucțiuni importante:</h3>
                        <ul>
                            <li>Prezentați biletul în format fizic sau electronic la intrare</li>
                            <li>Ajungeți cu cel puțin 30 de minute înainte de începerea meciului</li>
                            <li>Nu uitați să aduceți un act de identitate</li>
                        </ul>
                        
                        <p>Pentru orice întrebări, contactați-ne la: support@bilete.ro</p>
                        
                        <p>Vă dorim o experiență plăcută!</p>
                        <p>Echipa Bilete.ro</p>
                    `,
                    attachments: tickets
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Eroare trimitere email:', error);
                    } else {
                        console.log('Email trimis:', info.response);
                    }
                });

                // Răspuns succes
                res.json({
                    success: true,
                    orderId,
                    paymentId,
                    message: 'Plată procesată cu succes! Biletele au fost trimise pe email.'
                });
            }
        );
    } catch (error) {
        console.error('Eroare procesare plată:', error);
        res.status(500).json({ error: 'Eroare la procesarea plății' });
    }
});

// Endpoint pentru descărcare bilet
app.get('/api/download-ticket/:ticketId', async (req, res) => {
    const { ticketId } = req.params;

    try {
        // Verificare și preluare date bilet din baza de date
        pool.query(
            `SELECT pt.*, o.user_name, o.user_email 
             FROM purchased_tickets pt 
             JOIN orders o ON pt.order_id = o.order_id 
             WHERE pt.ticket_id = ?`,
            [ticketId],
            async (err, results) => {
                if (err || results.length === 0) {
                    return res.status(404).json({ error: 'Bilet negăsit' });
                }

                const ticket = results[0];
                const ticketData = {
                    ticketId: ticket.ticket_id,
                    invitationCode: ticket.invitation_code,
                    awayTeam: 'Echipa Oaspete', // Poți prelua din alt tabel
                    matchDate: new Date().toLocaleDateString('ro-RO'),
                    matchTime: '17:30',
                    sector: ticket.sector,
                    tribuna: ticket.tribuna,
                    row: ticket.rand,
                    seats: ticket.locuri,
                    numberOfTickets: ticket.numar_bilete,
                    totalPrice: ticket.pret,
                    userName: ticket.user_name,
                    userEmail: ticket.user_email
                };

                const pdfBuffer = await createTicketPDF(ticketData);

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=bilet-${ticketId}.pdf`);
                res.send(pdfBuffer);
            }
        );
    } catch (error) {
        console.error('Eroare generare PDF:', error);
        res.status(500).json({ error: 'Eroare la generarea biletului' });
    }
});