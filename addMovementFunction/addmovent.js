// Importación de módulos necesarios
const AWS = require('aws-sdk'); // AWS SDK para interactuar con los servicios de AWS.
const { v4: uuidv4 } = require('uuid'); // Generador de identificadores únicos.
const dynamoDB = new AWS.DynamoDB.DocumentClient(); // Cliente de DynamoDB para operaciones con documentos.
const lambda = new AWS.Lambda(); // Cliente Lambda para invocar otras funciones Lambda.

exports.handler = async (event) => {
    let requestBody;

    // Validación inicial del cuerpo de la solicitud (event.body)
    try {
        // Intenta parsear el cuerpo de la solicitud como JSON
        requestBody = event.body ? JSON.parse(event.body) : null;
    } catch (e) {
        // Retorna error 400 si el cuerpo de la solicitud no es JSON válido
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "El cuerpo de la solicitud no es un JSON válido" }),
        };
    }

    // Retorna error 400 si el cuerpo de la solicitud está vacío o es inválido
    if (!requestBody) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "El cuerpo de la solicitud está vacío o es inválido" }),
        };
    }

    // Asignación de valores automáticos y extracción de datos del cuerpo de la solicitud
    const id = uuidv4(); // Genera un ID único para el movimiento.
    const fecha = new Date().toISOString(); // Fecha actual en formato ISO.
    const tipoMovimiento = "SINPE móvil"; // Tipo de movimiento predefinido.
    const { nombreContacto, numeroContacto, monto, detalle } = requestBody; // Destructuración de datos.

    try {
        // 1. Verificar si el balance es suficiente antes de proceder
        const balanceParams = {
            FunctionName: 'getBalanceFunction', // Función Lambda para obtener el balance actual.
            InvocationType: 'RequestResponse', // Espera una respuesta inmediata.
            Payload: JSON.stringify({}), // No requiere parámetros adicionales.
        };

        // Invoca la función para obtener el balance actual
        const balanceResponse = await lambda.invoke(balanceParams).promise();
        const balanceResult = JSON.parse(balanceResponse.Payload);

        // Verifica el estado del balance
        if (balanceResult.statusCode !== 200 || balanceResult.balance < monto) {
            throw new Error(
                balanceResult.statusCode !== 200
                    ? 'Error al obtener el balance.' // Error al obtener el balance.
                    : 'Fondos insuficientes para realizar esta transferencia.' // Fondos insuficientes.
            );
        }

        // 2. Actualizar el balance del usuario
        const updateParams = {
            FunctionName: 'updateBalanceFunction', // Función Lambda para actualizar el balance.
            InvocationType: 'RequestResponse', // Espera una respuesta inmediata.
            Payload: JSON.stringify({
                body: JSON.stringify({ monto }), // Envía el monto como parámetro.
            }),
        };

        // Invoca la función para actualizar el balance
        const updateResponse = await lambda.invoke(updateParams).promise();
        const updateResult = JSON.parse(updateResponse.Payload);

        // Verifica el estado de la operación de actualización
        if (updateResult.statusCode !== 200) {
            throw new Error(`Error al actualizar el balance: ${updateResult.body}`);
        }

        // 3. Registrar el movimiento en la tabla DynamoDB
        const params = {
            TableName: 'MovimientosSinpe', // Nombre de la tabla DynamoDB.
            Item: {
                id, // ID único del movimiento.
                fecha, // Fecha del movimiento.
                nombreContacto, // Nombre del contacto.
                numeroContacto, // Número del contacto.
                monto, // Monto de la transferencia.
                detalle, // Detalles adicionales de la transferencia.
                tipoMovimiento, // Tipo de movimiento (predefinido como "SINPE móvil").
            },
        };

        // Inserta el movimiento en la tabla
        await dynamoDB.put(params).promise();

        // Respuesta exitosa
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Transferencia realizada con éxito.' }),
        };
    } catch (error) {
        // Manejo de errores y retorno de mensaje al cliente
        console.error('Error en la función Lambda:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
