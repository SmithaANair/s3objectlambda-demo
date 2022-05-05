const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const HTMLParser = require('node-html-parser');

exports.handler = async (event) => {
    console.log('start the s3 object lambda');
    console.log('start the s3 object lambda');
    const Key = event.Records[0].s3.object.key;
    const Bucket = event.Records[0].s3.bucket.name;
    console.log('Key----------' + Key);
    console.log('Bucket----------' + Bucket);

    const resp = await S3.getObject({
        Bucket: Bucket,
        Key
    }).promise();
    const respData = resp.Body;
    let dataInString = respData.toString('utf8');
    console.log(dataInString);

    const root = HTMLParser.parse(dataInString);
    const titlebarContainerElement = root.querySelector('.title-bar-container');
    if (null != titlebarContainerElement) {
        const navContainerElement = root.querySelector('#navContainer');
        if (null != navContainerElement) {
            console.log('Element already added to the html page');   
        } else {
            let d_nested = root.querySelector(".tab-bar");
            if (null != d_nested)
                d_nested.remove();
            titlebarContainerElement.innerHTML += `<div id="navContainer"></div>`;
            const modifiedData = root.toString('utf8');

            const params = {
                Body: modifiedData,
                ContentType: "text/html",
                Bucket: Bucket,
                Key: Key,
            };
            return await new Promise((resolve, reject) => {
                S3.putObject(params, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
        }
    } else {
        console.log('No Parent container found');
    }
    return ('status_code', 200);
}


