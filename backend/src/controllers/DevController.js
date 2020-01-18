const Dev = require('../models/Dev');
const axios = require('axios');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket')
module.exports = {
    async store(req, res){
            const { github_username, techs, latitude, longitude } = req.body;
            const apiResponse = await axios.get(`http://api.github.com/users/${github_username}`);
            if(!apiResponse)
                return res.status(404).send("Not was possible find a dev with that github username");
            const { name = login, avatar_url, bio } = apiResponse.data;
            const devExist = await Dev.findOne({github_username});
            if(devExist){
                return res.json(devExist);
            }
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            }
            const techsArray = parseStringAsArray(techs);
            const dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techsArray,
                location
            });
            
            if(!dev)
                return res.status(404).send("Not was possible create the Dev");

            const sendSocketMessageTo = findConnections(
                { latitude, longitude},
                 techsArray,
            )
            sendMessage(sendSocketMessageTo, 'new-dev', dev);

            return res.status(201).json(dev);
    },
    async index(req,res){
        const devs = await Dev.find();

        return res.status(200).json(devs);
    },
    async update(req, res){
        const {dev_id} = req.params;
        const { techs, latitude, longitude, name, bio } = req.body;
        const techsArray = parseStringAsArray(techs);
        const location = {
            type: 'Point',
            coordinates: [longitude, latitude],
        }
        try{
            const dev = await Dev.findByIdAndUpdate(dev_id,
            {
                $set: {
                    techs: techsArray,
                    name,
                    location,
                    bio
                    }
            },{useFindAndModify: false});
        if(!dev)
            return res.status(404).send("User not was found");
        return res.json(dev);
        }catch{
            return res.status(404).send("User not was found");
        }
    },
    async destroy(req,res){
        const { dev_id } = req.params;
        try{
            await Dev.findByIdAndDelete(dev_id);
            return res.status(200).send();
        }catch{
            return res.status(404).send('Not was possible delete this user');
        }
    }
}
