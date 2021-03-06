'use strict';

const Sequelize = require('sequelize');
const User = require('../db').User;
const Service = require('../db/index').Service;
const router = require('express').Router();

router.get('/:auth0_id', (req, res, next) => {
  User.findOne({
    where: {
      auth0_id: req.params.auth0_id
    }
  })
    .then(data => {
      console.log('User GET Request Successful');
      res.status(200).json(data);
    })
})

router.get('/', (req, res, next) => {
  User.findAll()
    .then(data => {
      console.log('User GET Request Successful');
      res.status(200).send(data);
    })
    .catch(next)
})

router.post('/', (req, res, next) => {
    req.user['auth0_id'] = req.user['sub'];
    User.upsert(req.user)
    .then(data => {
      console.log('User POST Request Successful')
      res.status(201);
      res.send('user posted successfully');
    })
    .catch(Sequelize.UniqueConstraintError, () => {
      res.status(400).end('User creation failed due to duplicate email address');
    })
})

router.put('/:auth0_id', (req, res, next) => {
  console.log(req.params);
    User.find({
      where: {
        auth0_id: req.params.auth0_id
      }
    })
    .then(data => {
        data.updateAttributes({
          email: req.body.email,
          name: req.body.name,
          address: req.body.address,
          geo_lat: req.body.address.lat,
          geo_long: req.body.address.lng,
          service_id: req.body.service_id,
          auth0_id: req.body.auth0_id
        })
        res.status(202).send(data);
    })
    .catch(next)
})

module.exports = router;


// delete: (req, res) => {
//   User.destroy({
//     where:{
//       email: req.body.email
//     }
//   })
//       .then(() => {
//         res.redirect('/');
//       })
//       .catch(err => {
//         console.log('Error with User DELETE REQ: ', err);
//         res.status(404);
//       })
// }