/**
 * Created by jhelmuth on 7/9/16.
 */

var Promise = require('bluebird');
var DataURI = require('datauri').promise;
var fs = require('fs');
Promise.promisifyAll(fs);
var path = require('path');
var _ = require('lodash');

var images = {};

function AvatarImages() {
    this.length = 0;
}

AvatarImages.prototype = {
    set: function set(key, data) {
        images[key] = data;
        this.length = _.size(images);
        return data;
    },
    get: function get(key) {
        if (this.has(key)) {
            return images[key];
        }
        return "";
    },
    has: function has(key) {
        return images.hasOwnProperty(key);
    },
    size: function size() {
        return _.size(images);
    },
    loadImageFromFile: function loadImageFromFile(key, filepath) {
        var self = this;
        return DataURI(filepath)
            .then(function (content) {
                self.set(key, content);
                return content;
            });
    },
    loadAllFromPath: function loadAllFromPath(image_path) {
        console.log('loadAllFromPath() image_path: ', image_path);
        if (!image_path) {
            return Promise.reject("No image path.");
        }
        var full_image_path = path.join(__dirname, '../..', image_path);
        var self = this;
        return Promise.reduce(
            fs.readdirAsync(full_image_path)
                .then(function (files) {
                    return files
                        .filter(function (filename) {
                            return path.extname(filename) == '.jpg';
                        })
                        .map(function (filename) {
                            var key = path.basename(filename, '.jpg');
                            return self.loadImageFromFile(key, path.join(full_image_path, filename));
                        });
                })
                .catch(function (err) {
                    console.log('Error occurred reading from directory ' + full_image_path + ': ', err);
                    throw err;
                }),
            function (res) {
                return res;
            },
            self
        ).catch(function (err) {
            console.log('Error loading images from directory ' + full_image_path, err);
            throw err;
        });
    }
};

module.exports = ai = new AvatarImages();

ai.set("android-mask", "data:image/png;base64,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");
ai.set("default", ai.get("android-mask"));