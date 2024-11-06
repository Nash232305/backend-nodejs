const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid'); // Importa la función para generar UUIDs únicos.
const dynamoDB = new AWS.DynamoDB.DocumentClient(); // Crea un cliente DocumentClient para interactuar con DynamoDB.
const lambda = new AWS.Lambda(); // Crea un cliente Lambda para invocar otras funciones Lambda.

// Handler principal de la función Lambda.
exports.handler = async (event) => {
    let requestBody;
    try {
        // Intenta parsear el cuerpo de la solicitud (event.body) como JSON.
        requestBody = event.body ? JSON.parse(event.body) : null;
    } catch (e) {
        // Devuelve un error 400 si el cuerpo de la solicitud no es un JSON válido.
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "El cuerpo de la solicitud no es un JSON válido" }),
        };
    }

    // Devuelve un error 400 si el cuerpo de la solicitud está vacío o es inválido.
    if (!requestBody) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "El cuerpo de la solicitud está vacío o es inválido" }),
        };
    }

    // Generar valores automáticos para el movimiento.
    const id = uuidv4(); // Genera un identificador único para el movimiento.
    const fecha = new Date().toISOString(); // Genera la fecha actual en formato ISO 8601.
    const tipoMovimiento = "SINPE móvil"; // Define el tipo de movimiento como fijo.

    // Extrae los valores enviados en el cuerpo de la solicitud.
    const { nombreContacto, numeroContacto, monto, detalle } = requestBody;

    try {
        // Llama a la función Lambda `updateBalanceFunction` para reducir el balance.
        const updateParams = {
            FunctionName: 'updateBalanceFunction', // Nombre de la función que actualiza el balance.
            InvocationType: 'RequestResponse', // Especifica que se espera una respuesta inmediata.
            Payload: JSON.stringify({
                body: JSON.stringify({ monto }) // Envía el monto como payload en el cuerpo de la solicitud.
            }),
        };

        const updateResponse = await lambda.invoke(updateParams).promise(); // Invoca la función Lambda.

        // Verifica la respuesta de `updateBalanceFunction`.
        const updateResult = JSON.parse(updateResponse.Payload); // Parse la respuesta de la función invocada.
        if (updateResult.statusCode !== 200) {
            // Si el balance no pudo ser actualizado, lanza un error con el mensaje de respuesta.
            throw new Error(updateResult.body);
        }

        // Si el balance se actualizó correctamente, registra el nuevo movimiento en DynamoDB.
        const params = {
            TableName: 'MovimientosSinpe', // Nombre de la tabla DynamoDB.
            Item: {
                id, // Identificador único del movimiento.
                fecha, // Fecha del movimiento.
                nombreContacto, // Nombre del contacto relacionado.
                numeroContacto, // Número del contacto relacionado.
                monto, // Monto del movimiento.
                detalle, // Detalles adicionales del movimiento.
                tipoMovimiento, // Tipo del movimiento (fijo como "SINPE móvil").
            },
        };

        await dynamoDB.put(params).promise(); // Inserta el nuevo movimiento en DynamoDB.

        // Devuelve una respuesta exitosa si todo salió bien.
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Movimiento agregado correctamente y balance actualizado' }),
        };
    } catch (error) {
        // Devuelve un error 500 si ocurre un problema en cualquier parte del proceso.
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
