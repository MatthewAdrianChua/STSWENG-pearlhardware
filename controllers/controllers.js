import database from '../model/db.js';
import { Product } from '../model/productSchema.js';
import { User } from '../model/userSchema.js';
import { Order } from '../model/orderSchema.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { Image } from '../model/imageSchema.js';

const SALT_WORK_FACTOR = 10;
let currentCategory = "allproducts";
const pageLimit = 15;

/*
    Checks if file is an image
*/
const isImage = (file) => {
    const mimeType = mime.lookup(file);
    return mimeType && mimeType.startsWith('image/');
};

const controller = {

    image: async (req, res) => {
        console.log("Image request received");
        const { id } = req.params;

        try {
            const image = await Image.findById(id);

            res.set('Content-Type', 'image/jpeg');
            res.send(image.img.data);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
      },

    showProduct: async function (req, res) {
        const id = req.body.id;
        const product = await Product.findByIdAndUpdate(id, { isShown: true });
        res.sendStatus(200);
    },

    hideProduct: async function (req, res) {
        const id = req.body.id;
        const product = await Product.findByIdAndUpdate(id, { isShown: false });
        res.sendStatus(200);
    },

    deleteProduct: async function (req, res) {

        const id = req.body.id;
        const result = await Product.deleteOne({ _id: id });

        if (result.deletedCount) {
            res.sendStatus(200);
        }
        else {
            res.sendStatus(201);
        }

    },

}

export default controller;
