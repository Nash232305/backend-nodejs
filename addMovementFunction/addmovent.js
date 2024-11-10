const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda({ region: "us-east-2" });

exports.handler = async (event) => {
  console.log("Inicio de la ejecución de la función.");

  let requestBody;
  try {
    requestBody = event.body ? JSON.parse(event.body) : null;
    if (!requestBody) {
      throw new Error("El cuerpo de la solicitud está vacío o es inválido.");
    }
  } catch (error) {
    console.error("Error al parsear el cuerpo de la solicitud:", error.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "El cuerpo de la solicitud no es un JSON válido." }),
    };
  }

  const { nombreContacto, numeroContacto, monto, detalle } = requestBody;
  if (!nombreContacto || !numeroContacto || !monto || monto <= 0 || !detalle) {
    console.error("Datos inválidos o incompletos:", requestBody);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Datos inválidos o incompletos en la solicitud." }),
    };
  }

  const userId = uuidv4();
  const fecha = new Date().toISOString();
  const tipoMovimiento = "SINPE móvil";
  const id = "default_user"; // Clave fija para la Partition Key

  try {
    console.log("Paso 1: Validar el balance actual.");

    const balanceResponse = await lambda.invoke({
      FunctionName: "getBalanceFunction",
      InvocationType: "RequestResponse",
      Payload: JSON.stringify({}),
    }).promise();
    const balanceResult = JSON.parse(balanceResponse.Payload);
    const balanceData = JSON.parse(balanceResult.body);

    if (balanceResult.statusCode !== 200 || !balanceData.balance) {
      console.error("Error al obtener el balance:", balanceResult);
      throw new Error("No se pudo obtener el balance del usuario.");
    }

    const currentBalance = balanceData.balance;
    if (currentBalance < monto) {
      console.error("Fondos insuficientes:", { currentBalance, monto });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Fondos insuficientes para realizar esta transferencia." }),
      };
    }

    console.log("Balance actual obtenido:", currentBalance);

    console.log("Paso 2: Registrar movimiento y actualizar balance en una transacción.");

    const transactionParams = {
      TransactItems: [
        {
          Put: {
            TableName: "MovimientosSinpe", // Nombre corregido
            Item: {
              id, // Partition Key (valor fijo)
              fecha, // Sort Key (fecha del movimiento)
              userId, // Identificador único adicional
              nombreContacto,
              numeroContacto,
              monto,
              detalle,
              tipoMovimiento,
            },
          },
        },
        {
          Update: {
            TableName: "UsuariosBalance", // Nombre corregido
            Key: { userId: "default_user" }, // Valor fijo para el usuario predeterminado
            UpdateExpression: "SET balance = balance - :monto",
            ConditionExpression: "balance >= :monto",
            ExpressionAttributeValues: {
              ":monto": monto,
            },
          },
        },
      ],
    };

    await dynamoDB.transactWrite(transactionParams).promise();
    console.log("Transacción completada correctamente.");

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Movimiento agregado correctamente y balance actualizado." }),
    };
  } catch (error) {
    console.error("Error durante la ejecución de la función:", error);

    if (error.code === "ResourceNotFoundException") {
      console.error("Recurso no encontrado. Revisa los nombres de tablas o funciones.");
    }

    if (error.code === "ConditionalCheckFailedException") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Fondos insuficientes o error de condición al actualizar el balance.",
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error interno del servidor.",
        details: error.message,
      }),
    };
  }
};
