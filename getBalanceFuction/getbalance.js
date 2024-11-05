const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const params = {
        TableName: 'UsuariosBalance',
        Key: {
            userId: "default_user"  // Ajusta el ID según tu necesidad
        }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ balance: data.Item.balance }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
