const request = require('supertest');
const assert = require('assert');

const app = require('../server');

describe('Server Tests', function () {
    describe('POST /', function () {
        it('should respond with a valid response', function (done) {
            const data = { data: 'Test question' };

            request(app)
                .post('/')
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    console.log(res.body);
                    // Add your assertions here to validate the response
                    assert.equal(res.body.question, data.data);
                    assert.strictEqual(typeof res.body.answer, 'string');

                    done();
                });
        });
    });

    describe('GET /history', function () {
        it('should respond with a valid history', function (done) {
            request(app)
                .get('/history')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);

                    // Add your assertions here to validate the history response
                    assert(Array.isArray(res.body));
                    assert(res.body.length >= 0);

                    done();
                });
        });
    });
    describe('POST /image', function () {
        it('should respond with a valid response', function (done) {
            const data = { data: 'Test description' };

            request(app)
                .post('/image')
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    console.log(res.body);
                    // Add your assertions here to validate the response
                    assert.equal(res.body.question, data.data);
                    assert.strictEqual(typeof res.body.answer, 'string');

                    done();
                });
        });
    });

    describe('GET /imagehistory', function () {
        it('should respond with a valid history', function (done) {
            request(app)
                .get('/imagehistory')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);

                    // Add your assertions here to validate the history response
                    assert(Array.isArray(res.body));
                    assert(res.body.length >= 0);

                    done();
                });
        });
        describe('POST /variation', function () {
            it('should respond with a valid response', function (done) {
                const filePath = './htdocs/Debug.png';

                request(app)
                    .post('/variation')
                    .attach('data', filePath) // Attach the test file to the request
                    .field('size', '256x256') // Provide other form data if required            
                    .expect(200)
                    .end(function (err, res) {
                        if (err) return done(err);
                        console.log(res.body);
                        // Add your assertions here to validate the response
                        //assert.equal(res.body.question, filePath);
                        assert.strictEqual(typeof res.body.answer, 'string');
                        assert.strictEqual(typeof res.body.question, 'string');
                        
                        done();
                    });
            });
        });

        describe('GET /variationhistory', function () {
            it('should respond with a valid history', function (done) {
                request(app)
                    .get('/variationhistory')
                    .expect(200)
                    .end(function (err, res) {
                        if (err) return done(err);

                        // Add your assertions here to validate the history response
                        assert(Array.isArray(res.body));
                        assert(res.body.length >= 0);

                        done();
                    });
            });
            describe('POST /image', function () {
                it('should respond with a valid response', function (done) {
                    const data = { data: 'Test description' };

                    request(app)
                        .post('/image')
                        .send(data)
                        .expect(200)
                        .end(function (err, res) {
                            if (err) return done(err);
                            console.log(res.body);
                            // Add your assertions here to validate the response
                            assert.equal(res.body.question, data.data);
                            assert.strictEqual(typeof res.body.answer, 'string');

                            done();
                        });
                });
            });

            describe('GET /imagehistory', function () {
                it('should respond with a valid history', function (done) {
                    request(app)
                        .get('/imagehistory')
                        .expect(200)
                        .end(function (err, res) {
                            if (err) return done(err);

                            // Add your assertions here to validate the history response
                            assert(Array.isArray(res.body));
                            assert(res.body.length >= 0);

                            done();
                        });
                });
            });
        });
    });
    // Add more test cases for other endpoints if needed

    // Clean up after all tests
    after(function () {
        // Add any necessary cleanup tasks
        setTimeout(function () {
            process.exit();
          }, 1000);
    });
});