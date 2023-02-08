const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let carryId = undefined;
  test('Create an issue with every field: POST request to /api/issues/{project}', (done) => {
    chai.request(server)
    .post('/api/issues/mochatest')
    .send({  issue_title: 'mochatest new', issue_text: 'new entry', created_by: 'mochamaster', assigned_to: 'mochafan', status_text: 'testing' })
    .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.notEqual(res.body.error, 'required field(s) missing');
        carryId = res.body._id
        done()
    })
  });

  test('Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
    chai.request(server)
    .post('/api/issues/mochatest')
    .send({issue_title: 'mochatest2', issue_text: 'mochachinno  latte', created_by: 'mochabarmaster'})
    .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.notEqual(res.body.error, 'required field(s) missing');
        done();
    })
  });

  test('Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
    chai.request(server)
    .post('/api/issues/mochatest')
    .send({issue_title: undefined, issue_text: 'missing title', created_by: 'mochadrunk'})
    .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'required field(s) missing');
        done();
    })
  });

  test('View issues on a project: GET request to /api/issues/{project}', (done) => {
    chai.request(server)
    .get('/api/issues/mochatest')
    .end((err, res) => {
        assert.equal(res.status, 200);
        expect(res.body).to.be.an( "array" ).that.is.not.empty;
        done();
    })
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
    chai.request(server)
    .get('/api/issues/mochatest')
    .query({ created_by: 'mochamaster'})
    .end((err, res) => {
        assert.equal(res.status, 200);
        expect(res.body).to.be.an(  'array' ).that.is.not.empty;
        done();
    })
  });

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
    chai.request(server)
    .get('/api/issues/mochatest')
    .query({ created_by: 'mochabarmaster', open: true})
    .end((err, res) => {
        assert.equal(res.status, 200);
        expect(res.body).to.be.an( 'array' ).that.is.not.empty;
        done();
    })
  });

  test('Update one field on an issue: PUT request to /api/issues/{project}', (done) => {
    chai.request(server)
    .put('/api/issues/mochatest')
    .send({_id: carryId, issue_title: 'mochatest edit 1'})
    .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.result, "successfully updated");
        done();
    })
  });

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', (done) => {
    chai.request(server)
    .put('/api/issues/mochatest')
    .send({_id: carryId, issue_title: 'to be deleted', created_by: 'spoiled mocha', issue_text: 'this mocha got spoiled', status_text: 'throwing away', open: false})
    .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.result, "successfully updated");
        done();
    })
  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', (done) => {
    chai.request(server)
    .put('/api/issues/mochatest')
    .send({ _id: undefined, issue_title: 'missing _id', created_by: 'drunk mocha'})
    .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'missing _id');
        done();
    })
  });

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', (done) => {
    chai.request(server)
    .put('/api/issues/mochatest')
    .send({ _id: carryId})
    .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
    })
  });
  
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', (done) => {
    chai.request(server)
    .put('/api/issues/mochatest')
    .send({ _id: 'thisidisveryveryveeeeryinvalidandnowaytobefound213554123', issue_title: 'missing _id', created_by: 'drunk mocha'})
    .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'could not update');
        done();
    })
  });

  test('Delete an issue: DELETE request to /api/issues/{project}', (done) => {
    chai.request(server)
    .delete('/api/issues/mochatest')
    .send({ _id: carryId})
    .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.result, 'successfully deleted');
        done();
    })
  });

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', (done) => {
    chai.request(server)
    .delete('/api/issues/mochatest')
    .send({_id: 'thisidisveryveryveeeeryinvalidandnowaytobefound213554123'})
    .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, "could not delete");
        done();
    })
  });

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', (done) => {
    chai.request(server)
    .delete('/api/issues/mochatest')
    .send({ _id: undefined })
    .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'missing _id');
        done();
    })
  });

});
