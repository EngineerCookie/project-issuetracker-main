'use strict';

module.exports = function (app) {
  let mongoose = require('mongoose')
  mongoose.set('strictQuery', false)
  mongoose.connect(
    process.env.MONGO_URI, 
      { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
      });
  
  let issueSchema = mongoose.Schema({
    issue_title: {
      type: String,
      require: true
    },
    issue_text: {
      type: String,
      require: true,
    },
    created_on: {
      type: Date,
      default: Date.now
    },
    updated_on: {
      type: Date,
      default: Date.now
    },
    created_by: {
      type: String,
      required: true
    },
    assigned_to: {
      type: String,
      default: ""
    },
    open: {
      type: Boolean,
      default: true
    },
    status_text: {
      type: String,
      default: ""
    }
  })

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
        let project = req.params.project;
        let issueModel = mongoose.model(project, issueSchema);
        let returnObj = await issueModel.find(req.query);
        if (returnObj.length < 1) {returnObj = await issueModel.find({})}
        res.json(returnObj) 
    })
    
    .post(async function (req, res){
      try {
      let project = req.params.project;
      let issueModel = mongoose.model(project, issueSchema);
      if (req.body.issue_title == undefined || req.body.issue_text == undefined || req.body.created_by == undefined) {
        throw new Error();
      }
      let returnObj = await issueModel.create(req.body);
      res.json(returnObj)        
      } catch (err) {
        res.json({ error: 'required field(s) missing' })
      }
    })
    
    .put(async function (req, res){
      try {
        if (req.body._id == undefined) {return res.json({ error: 'missing _id' })}
        let project = req.params.project;
        let issueModel = mongoose.model(project, issueSchema);
        let queryResult = {};
        let queryKeys = Object.keys(req.body);
        let filterEmpty = queryKeys.filter(key => {
          return req.body[key] != '' && key != '_id'
        });
        if (filterEmpty.length < 1) {return res.json({ error: 'no update field(s) sent', '_id': req.body._id })}
        filterEmpty.forEach(key => {
          queryResult[key] = req.body[key]
        });
        
        queryResult.updated_on = new Date();
        let returnObj = await issueModel.findOneAndUpdate(
          { _id: req.body._id},
          queryResult,
          {new: true},
        );
        res.json({result: "successfully updated", _id : returnObj._id});

      } catch (err) {
        res.json({"error":"could not update","_id":req.body._id});
      }

    })
    
    .delete(async function (req, res){
      try {
        if (req.body._id == undefined) {return res.json({ error: 'missing _id' })};
        let project = req.params.project;
        let issueModel = mongoose.model(project, issueSchema);
        let returnObj = await issueModel.findOneAndDelete({ _id: req.body._id});
        if (returnObj == null) {throw new Error()}
        res.json({ result : "successfully deleted", "_id":req.body._id })
      } catch(err) {
        res.json({ error : "could not delete", "_id" : req.body._id })
      }
    });
    
};