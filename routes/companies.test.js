process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let apple = { code: "apple", name: "Apple Computer" };
let ibm = { code: "ibm", name: "IBM" }

// let apple;
// let ibm;

// beforeEach(async function() {
//   let result = await db.query(`
//     INSERT INTO
//       cats (name) VALUES ('TestCat')
//       RETURNING id, name`);
//   testCat = result.rows[0];
// });


beforeAll(async function() {
  await db.query(`CREATE TABLE IF NOT EXISTS 
    companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text)`)
}); 

beforeEach(async function() {
  await db.query(`
    INSERT INTO companies
    VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
          ('ibm', 'IBM', 'Big blue.')`);       
});

// beforeEach(async function() {
//   let result = await db.query(`
//     INSERT INTO companies
//     VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
//           ('ibm', 'IBM', 'Big blue.')`);
//   apple = result.rows[0];
// });

afterEach(async function() {
  await db.query(`DELETE FROM companies`)
});

afterAll(async function() {
  await db.query(`DROP TABLE companies`)
});

// end afterEach

/** GET /companies - returns `{companies: [code, name, ...]}` */

describe("GET /companies", function() {
  test("Gets list of companies", async function() {
    const resp = await request(app).get(`/companies`);
    expect(resp.statusCode).toBe(200);

    // expect(resp.body).toEqual({companies: [apple, ibm]});

    expect(resp.body).toEqual({companies: [apple, ibm]});
  });
});
// end


/** GET /companies/[code] - return data about one company: `{company: company}` */

describe("GET /companies/:code", function() {
  test("Gets a single company", async function() {
    const response = await request(app).get(`/companies/${apple.code}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({company: apple});
  });

  test("Responds with 404 if can't find company", async function() {
    const response = await request(app).get(`/companies/0`);
    expect(response.statusCode).toEqual(404);
  });
});
// end



// /** GET /companies/[code] - return data about one company: `{company: company}` */

// describe("GET /companies/:code", function() {
//   test("Gets a single company", async function() {
//     const resp = await request(app).get(`/companies/${apple.code}`);
//     expect(resp.statusCode).toBe(200);

//     expect(resp.body).toEqual({company: apple});
//   });

//   test("Responds with 404 if can't find company with code", async function() {
//     const resp = await request(app).get(`/companies/0`);
//     expect(resp.statusCode).toBe(404);
//   });
// });
// // end

/** POST /companies - create company from data; return `{company: company}` */

describe("POST /companies", function() {
  test("Creates a new company", async function() {
    const resp = await request(app)
      .post(`/companies`)
      .send({
        code: "microsoft",
        name: "Microsoft",
        description: "Microsoft 365"
      });
    expect(resp.statusCode).toBe(201);
    expect(resp.body).toEqual({
        company: {
            code: "microsoft",
            name: "Microsoft",
            description: "Microsoft 365"
        }
    });
  });
});
// end

// /** PUT /companies/[code] - update company; return `{company: company}` */

// describe("PUT /companies/:code", function() {
//   test("Updates a single company", async function() {
//     const resp = await request(app)
//       .patch(`/companies/${microsoft.code}`)
//       .send({
//         name: "Dell",
//         description: "monitor"
//       });
//     expect(resp.statusCode).toBe(200);
//     expect(resp.body).toEqual({
//         company: {
//             code: "microsoft",
//             name: "Dell",
//             description: "monitor"
//         }
//     });
//   });

//   test("Responds with 404 if code invalid", async function() {
//     const resp = await request(app).patch(`/companies/0`);
//     expect(resp.statusCode).toBe(404);
//   });
// });
// // end

// /** DELETE /company/[code] - delete company,
//  *  return `{message: "Deleted"}` */

// describe("DELETE /companies/:code", function() {
//   test("Deletes a single a company", async function() {
//     const resp = await request(app).delete(`/companies/${microsoft.name}`);
//     expect(resp.statusCode).toBe(200);
//     expect(resp.body).toEqual({ message: "Deleted" });
//   });
// });
// // end