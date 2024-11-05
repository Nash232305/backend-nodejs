const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // Suponemos que el monto a restar viene en event.body o como parámetro de la llamada
    const { monto } = JSON.parse(event.body);

    const getParams = {
        TableName: 'UsuariosBalance',
        Key: { userId: "default_user" } // Ajusta el ID según tu necesidad
    };

    try {
        // Obtener el balance actual
        const data = await dynamoDB.get(getParams).promise();
        if (!data.Item || data.Item.balance === undefined) {
            throw new Error("No se encontró un balance para el usuario");
        }

        // Calcular el nuevo balance
        const nuevoBalance = data.Item.balance - monto;

        // Actualizar el balance en la base de datos
        const updateParams = {
            TableName: 'UsuariosBalance',
            Key: { userId: "default_user" },
            UpdateExpression: 'set balance = :newBalance',
            ExpressionAttributeValues: {
                ':newBalance': nuevoBalance
            },
            ReturnValues: "UPDATED_NEW"
        };

        const result = await dynamoDB.update(updateParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Balance actualizado', balance: result.Attributes.balance })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
