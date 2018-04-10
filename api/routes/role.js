const express = require('express');
const router = express.Router();
const Role = require('../models/role');

const config = require('../../config');

/*  Possible Routes  */

const RequestUrl = function () {
    return {
        'list': {
            "url": config.baseUrl + 'roles',
            "method": "GET",
        },
        'details': {
            "url": config.baseUrl + 'roles',
            "method": "GET",
        },
        'create': {
            "url": config.baseUrl + 'roles',
            "method": "POST",
        },
        'update': {
            "url": config.baseUrl + 'roles',
            "method": "PUT",
        },
        'delete': {
            "url": config.baseUrl + 'roles',
            "method": "DELETE",
        },
    };
}



/*  Listing  */
router.get('/', (request, response) => {
    Role.find()
        .exec()
        .then((data) => {
            let preparedData = data.map((tmpData) => {

                /* Add Role Id to Url  */
                let tmpRequestData = new RequestUrl();
                tmpRequestData.details.url = tmpRequestData.details.url + '/' + tmpData._id;

                return {
                    _id: tmpData._id,
                    name: tmpData.name,
                    requests: [{
                        'details': tmpRequestData.details
                    }]
                }
            });

            let responseData = {
                count: preparedData.length,
                data: preparedData
            };

            return response.status(200).json(responseData);
        })
        .catch((error) => {
            return response.status(500).json({
                'error': error.message
            });
        });

});

/*  Details  */
router.get('/:roleId', (request, response) => {
    Role.findOne({
            _id: request.params.roleId
        })
        .exec()
        .then((data) => {
            let tmpRequestData = new RequestUrl();
            tmpRequestData.delete.url = tmpRequestData.delete.url + '/' + data._id;
            tmpRequestData.update.url = tmpRequestData.update.url + '/' + data._id;

            delete tmpRequestData.details;
            delete tmpRequestData.create;

            let responseData = {
                _id: data._id,
                name: data.name,
                requests: tmpRequestData
            }

            return response.status(200).json(responseData);
        })
        .catch((error) => {
            return response.status(500).json({
                'error': error.message
            });
        });

});

/*  Create  */
router.post('/', (request, response) => 
{
    /*  Check Duplication  */
    Role.findOne({
            name: request.body.name,
        })
        .then((data) => {
            if (data) {
                return response
                    .status(500)
                    .json({
                        message: "Role Already Exists"
                    });
            }
        })
        .catch((error) => {
            return response
                .status(500)
                .json({
                    message: error.message
                });
        });

    /* Create New Role */    
    const role = new Role({
        name: request.body.name
    });

    role.save()
        .then((data) => {
            /* Add Role Id to Url  */
            let tmpRequestData = new RequestUrl();
            tmpRequestData.details.url = tmpRequestData.details.url + '/' + role._id;

            return response
                .status(201)
                .json({
                    message: "Role Created Succesfuly",
                    requests: [{
                        'details': tmpRequestData.details
                    }]
                });
        })
        .catch((error) => {

            return response
                .status(500)
                .json({
                    status: 'failure',
                    message: error.message
                });
        })

});

/*  Edit  */
router.put('/:roleId', (request, response) => {
   
    /*  Check Duplication  */
    Role.findOne({
            name: request.body.name,
            _id: {
                $ne: request.params.roleId
            }
        })
        .then((data) => {
            if (data) {
                return response
                    .status(500)
                    .json({
                        message: "Role Already Exists"
                    });
            }
        })
        .catch((error) => {
            return response
                .status(500)
                .json({
                    message: error.message
                });
        });

    /* Update Role */
    const role = {
        name: request.body.name
    };

    Role.update({
            _id: request.params.roleId
        }, {
            $set: role
        })
        .exec()
        .then((data) => {

            let tmpRequestData = new RequestUrl();
            tmpRequestData.details.url = tmpRequestData.details.url + '/' + role._id;

            return response
                .status(200)
                .json({
                    message: "Role Updated Succesfuly",
                    requests: [{
                        'details': tmpRequestData.details
                    }]
                });
        })
        .catch((error) => {

            return response
                .status(500)
                .json({
                    message: error.message
                });
        })
});

/*  Delete  */
router.delete('/:roleId', (request, response) => {

    Role.deleteOne({
            _id: request.params.roleId
        })
        .exec()
        .then((data) => {

            return response
                .status(200)
                .json({
                    message: "Role Deleted Succesfuly",
                    requests: []
                });
        })
        .catch((error) => {

            return response
                .status(500)
                .json({
                    message: error.message
                });
        })
});

module.exports = router;