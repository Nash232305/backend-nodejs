const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // Obtener id y fecha desde los parámetros de la ruta
    const { id, fecha } = event.pathParameters;

    const params = {
        TableName: 'MovimientosSinpe',
        KeyConditionExpression: 'id = :id and fecha = :fecha',
        ExpressionAttributeValues: {
            ':id': id,
            ':fecha': fecha
        }
    };

    try {
        const data = await dynamoDB.query(params).promise();

        if (data.Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Movimiento no encontrado" })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data.Items[0])
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
