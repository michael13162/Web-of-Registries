/* SynBioHub Federator
 * Web of Registries
 *
 * SynBioHub registration endpoint
 *
 * Written by Zach Zundel
 * 16-06-2017
 */

import { Request, Response } from 'express';
import { SynBioHub, User } from '../lib/db';
import { sendMail } from '../lib/mail'
import { broadcast } from './approve';
import * as crypto from 'crypto';
import * as requests from 'request';

function register(req: Request, res: Response) {

    let uriPrefix = req.body.uriPrefix;
    let instanceUrl = req.body.instanceUrl;
    let updateEndpoint = req.body.updateEndpoint;

    if(uriPrefix !== undefined && uriPrefix[uriPrefix.length - 1] == '/') {
        uriPrefix = uriPrefix.substring(0, uriPrefix.length - 1);
    }

    if(instanceUrl !== undefined && instanceUrl[instanceUrl.length - 1] == '/') {
        instanceUrl = instanceUrl.substring(0, instanceUrl.length - 1);
    }

    if(updateEndpoint !== undefined && updateEndpoint[0] == '/') {
        updateEndpoint = updateEndpoint.substring(1);
    }

    SynBioHub.create({
        uriPrefix: uriPrefix,
        instanceUrl: instanceUrl,
        administratorEmail: req.body.administratorEmail,
        updateEndpoint: updateEndpoint,
        name: req.body.name,
        description: req.body.description,
        updateSecret: crypto.randomBytes(48).toString('hex'),
        approved: false,
        updateWorking: false
    }).then(synbiohub => {
        let updateUrl = [synbiohub.instanceUrl, synbiohub.updateEndpoint].join('');
        broadcast(synbiohub);

        let resultJson = JSON.stringify({
            id: synbiohub.get('id'),
            name: synbiohub.get('name'),
            description: synbiohub.get('description'),
            uriPrefix: synbiohub.get('uriPrefix'),
            instanceUrl: synbiohub.get('instanceUrl'),
            updateSecret: synbiohub.get('updateSecret'),
            administratorEmail: synbiohub.get('administratorEmail'),
            updateEndpoint: synbiohub.get('updateEndpoint')
        }, null, 4);

        User.findAll().then(users => {
            users.forEach(user => {
                sendMail(user, "New Registry Pending Approval", "Hi! A new registry called " + synbiohub.name + " needs to be approved on the Web of Registries.");
            })

            res.send(resultJson);
        })
    }).catch(err => {
        res.status(400);
        res.send(err);
    });
}

export {
    register
};