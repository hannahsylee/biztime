/** Routes for users of pg-intro-demo. */

const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT code, name
            FROM companies
            ORDER BY name`
        );
        return res.json({ companies: results.rows })
    } catch (e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const companiesResults = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code = $1`,
            [code]
        );
        const invoicesResults = await db.query(
            `SELECT id
            FROM invoices
            WHERE comp_code = $1`,
            [code]
        );
        if (companiesResults.rows.length === 0) {
            throw new ExpressError(`Can't find user with code of ${code}`, 404)
    }

        const company = companiesResults.rows[0];
        const invoices = invoicesResults.rows;

        company.invoices = invoices.map(inv => inv.id);

        return res.json({ company: company })
    } catch (e) {
        return next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        let { name, description } = req.body;
        let code = slugify(name, {lower: true});
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
        return res.status(201).json({ company: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

router.put("/:id", async function (req, res, next){
    try {
        let { amt, paid } = req.body;
        let id = req.params.id;
        let paidDate = null;

        const currResult = await db.query(
            `SELECT paid
            FROM invoices
            WHERE id = $1`,
            [id]);
        if (currResult.rows.length === 0){
            throw new ExpressError(`No such invoice: ${id}`, 404);
        }
        const currPaidDate = currResult.rows[0].paid_date;

        if (!currPaidDate && paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null
        } else {
            paidDate = currPaidDate;
        }

        const result = await db.query(
            `UPDATE invoices
            SET amt$1, paid=$2, paid_date=$3
            WHERE id=$4
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, paidDate, id]);
        return res.json({"invoice": result.rows[0]});
    }
    catch(err){
        return next(err);
    }
});

router.put("/:code", async function (req, res, next) {
    try {
        let {name, description} = req.body;
        let code = req.params.code;

        const result = await db.query(
            `UPDATE companies
                SET name=$1, description=$2
                WHERE code = $3
                RETURNING code, name, description`,
            [name, description, code]);

        if (result.rows.length === 0) {
            throw new ExpressError(`No such company: ${code}`, 404)
        } else {
            return res.json({"company": result.rows[0]});
        }
    }
  
    catch (err) {
        return next(err);
    }
  
});

router.delete('/:code', async (req, res, next) => {
    try {
        const results = db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
        return res.send({ msg: "DELETED!" })
    } catch (e) {
        return next(e)
    }
})


module.exports = router;