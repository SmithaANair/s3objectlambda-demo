const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

exports.handler = async (event) => {
    console.log('start the s3 object lambda');
    const Key = event.Records[0].s3.object.key;
    const Bucket = event.Records[0].s3.bucket.name;
    const resp = await S3.getObject({
        Bucket: Bucket,
        Key
    }).promise();
    const respData = resp.Body;
    const dataInString = respData.toString('utf8');

    const dom = new JSDOM(dataInString);
    const navContainerElement = dom.window.document.querySelector('#navContainer');
    if (null != navContainerElement) {
        console.log('Element already added to the html page');
        return ('status_code', 200);
    } else {
        const body = dom.window.document.querySelector("body");
        const script = dom.window.document.createElement('script');
        script.setAttribute(
            'src',
            '/assets/app.js',
        );
        body.appendChild(script);

        const head = dom.window.document.querySelector("head");
        const link = dom.window.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/assets/app.css';
        head.appendChild(link);

        const tabBarContainer = dom.window.document.querySelector(".tab-bar");
        /* if (null != tabBarContainer)
        tabBarContainer.remove();
        titlebarContainerElement.appendChild(divContainer); */

        const divContainer = dom.window.document.createElement('div');
        divContainer.setAttribute('id', 'navContainer');
        tabBarContainer.replaceWith(divContainer);

        const modifiedData = dom.window.document.documentElement.outerHTML;
        console.log(modifiedData);

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
}
