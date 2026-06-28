const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let transactions = [];

app.post('/api/process-payment', (req, res) => {
    const { cardNumber, amount, orderId } = req.body;


    if (cardNumber.startsWith('4') || cardNumber.startsWith('5')) {
        
        const transactionId = Math.random().toString(36).substring(2, 15);
        const timestamp = new Date().toISOString();

      
        const transaction = {
            transactionId,
            orderId,
            amount,
            cardLastFour: cardNumber.slice(-4),
            timestamp,
            status: 'completed'
        };

        transactions.push(transaction);

       
        setTimeout(() => {
            res.status(200).json({
                success: true,
                transaction
            });
        }, 1500);
    } else {

        setTimeout(() => {
            res.status(400).json({
                success: false,
                error: 'Card declined',
                message: 'Plata a fost respinsă de banca emitentă.'
            });
        }, 1500);
    }
});


app.get('/api/transactions', (req, res) => {
    res.json(transactions);
});

app.listen(port, () => {
    console.log(`Server mock pentru procesare plăți rulează pe portul ${port}`);
});