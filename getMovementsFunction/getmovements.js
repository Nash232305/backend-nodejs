const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const { lastEvaluatedKey, limit } = event.queryStringParameters || {};

    const params = {
        TableName: 'MovimientosSinpe',
        KeyConditionExpression: 'id = :id', // Filtra por Partition Key
        ExpressionAttributeValues: {
            ':id': 'default_user', // Valor fijo para la Partition Key
        },
        ScanIndexForward: false, // Orden descendente (más reciente primero)
        Limit: parseInt(limit, 10) || 10, // Límite de elementos a devolver
    };

    if (lastEvaluatedKey) {
        params.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastEvaluatedKey));
    }

    try {
        const data = await dynamoDB.query(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                items: data.Items,
                lastEvaluatedKey: data.LastEvaluatedKey
                    ? encodeURIComponent(JSON.stringify(data.LastEvaluatedKey))
                    : null,
            }),
        };
    } catch (error) {
        console.error('Error al consultar DynamoDB:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
