var express = require('express');
var router = express.Router();
var mssql = require('mssql')
var axios = require('axios')
var connection = new mssql.ConnectionPool({
    user: 'dbms',
    password: '123123',
    server: 'localhost',
    database: 'BankDB',
    port: 1433
}).connect();



router.post('/login', async (req, res, next) => {
    const pool = await connection;

    pool.request()
        .query(`SELECT * FROM Musteriler WHERE Tc='${req.body.Tc}' AND Sifre='${req.body.Sifre}'`, (err, row, fields) => {
            if (err) {
                console.log(err)
                res.status(400).json({ err })
                return;
            }
            if (row.recordset.length > 0) {
                res.status(200).json({
                    'success': true, 'data': row.recordset[0]
                })
            } else {
                res.status(400).json({
                    'success': false, data: null
                })
            }


        })
});

router.post('/register', async (req, res, next) => {
    const pool = await connection;
    const query = `INSERT INTO Musteriler (Tc,Sifre,Ad,Soyad,Cep,Adres) VALUES ('${req.body.Tc}','${req.body.Sifre}','${req.body.Ad}','${req.body.Soyad}','${req.body.Cep}','${req.body.Adres}')`;

    pool.request().query(query, (err, row, fields) => {
        if (err) {
            console.log(err);
            res.status(400).json({ err })
            return;
        }

        if (row.rowsAffected[0] > 0) {
            res.status(200).json({
                'success': true, 'data': true
            })
        } else {
            res.status(400).json({
                'success': false, data: null
            })
        }
    })
});

router.post('/newaccount', async (req, res, next) => {
    const pool = await connection;

    const numberOfAccountsQuery = `SELECT * FROM Hesaplar WHERE MusteriID = ${req.body.MusteriID}`
    const tcOfCustomer = `SELECT Tc FROM Musteriler WHERE Id = ${req.body.MusteriID}`
    let numberOfAccounts, tc;

    pool.request().query(numberOfAccountsQuery, (err, row, fields) => {
        if (err) {
            console.log(err);
            res.status(400).json({ err })
            return;
        }
        numberOfAccounts = row.rowsAffected[0]

        pool.request().query(tcOfCustomer, (err, row, fields) => {
            if (err) {
                console.log(err);
                res.status(400).json({ err })
                return;
            }

            tc = row.recordset[0].Tc;

            const hesapNo = `${tc.slice(0, 2)}${numberOfAccounts + 1001}`

            const newAccountQuery = `INSERT INTO Hesaplar (HesapNo,MusteriID,Bakiye,isActive) VALUES ('${hesapNo}',${req.body.MusteriID},0,1); SELECT * FROM Hesaplar WHERE MusteriID = ${req.body.MusteriID}`;

            pool.request().query(newAccountQuery, (err, row, fields) => {
                if (err) {
                    console.log(err);
                    res.status(400).json({ err })
                    return;
                }

                if (row.rowsAffected[1] > 0) {
                    res.status(200).json({
                        'success': true, 'data': row.recordset
                    })
                } else {
                    res.status(400).json({
                        'success': false, data: null
                    })
                }

            });

        });
    });

});

router.post('/getaccounts', async (req, res, next) => {
    const pool = await connection;

    const query = `SELECT * FROM Hesaplar WHERE MusteriID = ${req.body.MusteriID} AND isActive != 0`;


    pool.request().query(query, (err, row, fields) => {
        if (err) {
            console.log(err);
            res.status(400).json({ err })
            return;
        }

        if (row.rowsAffected[0] > 0) {
            res.status(200).json({
                'success': true, 'data': row.recordset
            })
        } else {
            res.status(400).json({
                'success': false, data: null
            })
        }


    })
});

router.post('/deleteaccounts', async (req, res, next) => {
    const pool = await connection;

    const query = `UPDATE Hesaplar SET isActive = 0 WHERE HesapNo = ${req.body.HesapNo}`;

    pool.request().query(query, (err, row, fields) => {
        if (err) {
            console.log(err);
            res.status(400).json({ err })
            return;
        }

        if (row.rowsAffected[0] > 0) {
            res.status(200).json({
                'success': true, 'data': row.recordset
            })
        } else {
            res.status(400).json({
                'success': false, data: null
            })
        }


    })
});

router.post('/depositmoney', async (req, res, next) => {
    const pool = await connection;

    const query = `UPDATE Hesaplar SET Bakiye = Bakiye + ${req.body.amount} WHERE HesapNo = ${req.body.HesapNo}`;

    pool.request().query(query, (err, row, fields) => {
        if (err) {
            console.log(err);
            res.status(400).json({ err })
            return;
        }

        if (row.rowsAffected[0] > 0) {
            res.status(200).json({
                'success': true, 'data': row.recordset
            })
        } else {
            res.status(400).json({
                'success': false, data: null
            })
        }


    })
});

router.post('/transfermoney', async (req, res, next) => {
    const pool = await connection;

    const query = `UPDATE Hesaplar SET Bakiye = Bakiye + ${req.body.amount} WHERE HesapNo = ${req.body.HesapNo} ; UPDATE Hesaplar SET Bakiye = Bakiye - ${req.body.amount} WHERE HesapNo = ${req.body.gonderenHesapNo}`;

    pool.request().query(query, (err, row, fields) => {
        if (err) {
            console.log(err);
            res.status(400).json({ err })
            return;
        }

        if (row.rowsAffected[0] > 0) {
            res.status(200).json({
                'success': true, 'data': row.recordset
            })
        } else {
            res.status(400).json({
                'success': false, data: null
            })
        }


    })
});

router.post('/eftmoney', async (req, res, next) => {
    const pool = await connection;

    const query = `UPDATE Hesaplar SET Bakiye = Bakiye + ${req.body.amount} WHERE HesapNo = ${req.body.HesapNo} ; UPDATE Hesaplar SET Bakiye = Bakiye - ${req.body.amount} WHERE HesapNo = ${req.body.gonderenHesapNo}`;

    pool.request().query(query, (err, row, fields) => {
        if (err) {
            console.log(err);
            res.status(400).json({ err })
            return;
        }

        if (row.rowsAffected[0] > 0) {
            res.status(200).json({
                'success': true, 'data': row.recordset
            })
        } else {
            res.status(400).json({
                'success': false, data: null
            })
        }


    })
});

router.post('/withdrawmoney', async (req, res, next) => {
    const pool = await connection;

    const query = `UPDATE Hesaplar SET Bakiye = Bakiye - ${req.body.amount} WHERE HesapNo = ${req.body.HesapNo}`;

    pool.request().query(query, (err, row, fields) => {
        if (err) {
            console.log(err);
            res.status(400).json({ err })
            return;
        }

        if (row.rowsAffected[0] > 0) {
            res.status(200).json({
                'success': true, 'data': row.recordset
            })
        } else {
            res.status(400).json({
                'success': false, data: null
            })
        }


    })
});


router.post('/whois', async (req, res, next) => {
    const pool = await connection;

    const query = `SELECT Ad,Soyad from Musteriler JOIN Hesaplar ON Musteriler.Id = Hesaplar.MusteriID AND Hesaplar.HesapNo = ${req.body.HesapNo}`;

    pool.request().query(query, (err, row, fields) => {
        if (err) {
            console.log(err);
            res.status(400).json({ err })
            return;
        }

        if (row.rowsAffected[0] > 0) {
            res.status(200).json({
                'success': true, 'data': row.recordset
            })
        } else {
            res.status(400).json({
                'success': false, data: null
            })
        }


    })
});


router.post('/transaction', async (req, res, next) => {
    const pool = await connection;

    const query = `INSERT INTO İşlemler (Type,Date,Time,Sender,Reciever,Id,Amount) VALUES ('${req.body.type}','${req.body.date}',
    '${req.body.time}','${req.body.sender}','${req.body.reciever}',${req.body.id},${req.body.amount})`;

    pool.request().query(query, (err, row, fields) => {
        if (err) {
            console.log(err);
            res.status(400).json({ err })
            return;
        }

        if (row.rowsAffected[0] > 0) {
            res.status(200).json({
                'success': true, 'data': row.recordset
            })
        } else {
            res.status(400).json({
                'success': false, data: null
            })
        }


    })
});

router.post('/gethistory', async (req, res, next) => {
    const pool = await connection;

    const query = `SELECT * FROM İşlemler WHERE Id = ${req.body.id}`;

    pool.request().query(query, (err, row, fields) => {
        if (err) {
            console.log(err);
            res.status(400).json({ err })
            return;
        }

        if (row.rowsAffected[0] > 0) {
            res.status(200).json({
                'success': true, 'data': row.recordset
            })
        } else {
            res.status(400).json({
                'success': false, data: null
            })
        }


    })
});

router.post('/getbill', async (req, res, next) => {
    try {
        const { data } = await axios.post('http://127.0.0.1:5000/gediz/getbill', {
            AboneNo: req.body.AboneNo
        })


        res.send(data);

    }
    catch (error) {
        res.status(400).send({ msg: 'Abone No Bulunamadı' })
    }
});

router.post('/paybill', async (req, res, next) => {

    const pool = await connection;
    const query = `SELECT Bakiye FROM Hesaplar WHERE HesapNo = '${req.body.HesapNo}'`;
    try {
        const { data: { data } } = await axios.get(`http://localhost:5000/gediz/getbill/${req.body.FaturaID}`);
        const resFromDB = await pool.request().query(query);

        if (resFromDB.rowsAffected[0] > 0) {
            const bakiye = resFromDB.recordset[0].Bakiye;
            if (data.Borç <= bakiye) {
                const query = `UPDATE Hesaplar SET Bakiye=${bakiye - data.Borç} WHERE HesapNo = '${req.body.HesapNo}'`;
                const resFromDB = await pool.request().query(query);

                if (resFromDB.rowsAffected[0] > 0) {
                    try {
                        const { data } = await axios.get(`http://localhost:5000/gediz/paybill/${req.body.FaturaID}`);
                        return res.status(200).send({ success: true });
                    } catch (error) {
                        const query = `UPDATE Hesaplar SET Bakiye=${bakiye + data.Borç} WHERE HesapNo = '${req.body.HesapNo}'`;

                        await pool.request().query(query);
                        return res.status(400).send({ success: false, msg: "ic ice try catch" });
                    }
                } else {
                    return res.status(400).send({ success: false, msg: "bakiyeyi dusemedik" });
                }

            } else {
                return res.status(400).send({ success: false, msg: "borc bakiyeden buyuk" });
            }

        } else {
            return res.status(400).json({
                'success': false, data: "hesabi bulamadim"
            })
        }

    }
    catch (error) {
        return res.send({ error })
    }
});



router.get("/", (req, res, next) => {
    res.send("Baglaniyooor");
})

module.exports = router