const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Bază de date simplă pentru a stoca tranzacțiile
let transactions = [];

// Endpoint pentru procesarea plăților
app.post('/api/process-payment', (req, res) => {
    const { cardNumber, amount, orderId } = req.body;

    // Logica simplă de simulare:
    // - Cardurile care încep cu 4 sunt acceptate (Visa simulată)
    // - Cardurile care încep cu 5 sunt acceptate (Mastercard simulată)
    // - Alte carduri pot fi respinse pentru a demonstra gestionarea erorilor

    if (cardNumber.startsWith('4') || cardNumber.startsWith('5')) {
        // Generează un ID de tranzacție și timestamp
        const transactionId = Math.random().toString(36).substring(2, 15);
        const timestamp = new Date().toISOString();

        // Stochează tranzacția
        const transaction = {
            transactionId,
            orderId,
            amount,
            cardLastFour: cardNumber.slice(-4),
            timestamp,
            status: 'completed'
        };

        transactions.push(transaction);

        // Simulează procesare asincronă (delay 1.5 secunde)
        setTimeout(() => {
            res.status(200).json({
                success: true,
                transaction
            });
        }, 1500);
    } else {
        // Simulează eroare la cardurile care nu încep cu 4 sau 5
        setTimeout(() => {
            res.status(400).json({
                success: false,
                error: 'Card declined',
                message: 'Plata a fost respinsă de banca emitentă.'
            });
        }, 1500);
    }
});

// Endpoint pentru a verifica istoricul tranzacțiilor (util pentru demonstrație)
app.get('/api/transactions', (req, res) => {
    res.json(transactions);
});

app.listen(port, () => {
    console.log(`Server mock pentru procesare plăți rulează pe portul ${port}`);
});