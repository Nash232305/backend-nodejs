const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

exports.handler = async (event) => {
    // Asegúrate de que event.body esté en formato JSON, o retorna un error si no está definido
    let requestBody;
    try {
        requestBody = event.body ? JSON.parse(event.body) : null;
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "El cuerpo de la solicitud no es un JSON válido" }),
        };
    }

    if (!requestBody) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "El cuerpo de la solicitud está vacío o es inválido" }),
        };
    }

    const { id, nombreContacto, numeroContacto, monto, fecha, detalle, tipoMovimiento } = requestBody;

    if (!id || !fecha) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Los campos 'id' y 'fecha' son obligatorios" }),
        };
    }

    const params = {
        TableName: 'MovimientosSinpe',
        Item: {
            id,
            fecha,
            nombreContacto,
            numeroContacto,
            monto,
            detalle,
            tipoMovimiento
        },
    };

    try {
        // Agrega el movimiento a la base de datos
        await dynamoDB.put(params).promise();

        // Llama a la función updateBalanceFunction para reducir el balance
        const updateParams = {
            FunctionName: 'updateBalanceFunction', // Nombre de la función que actualiza el balance
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({
                body: JSON.stringify({ monto }) // Envía el monto como payload
            })
        };

        const updateResponse = await lambda.invoke(updateParams).promise();

        // Verifica el resultado de la actualización del balance
        const updateResult = JSON.parse(updateResponse.Payload);
        if (updateResult.statusCode !== 200) {
            throw new Error(updateResult.body);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Movimiento agregado correctamente y balance actualizado' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
