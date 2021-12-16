import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  isSignatureValid,
  webhookHandler,
} from "../services/woocommerce-webhook";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  console.log("wchook fired");

  const contentType = req.headers["content-type"];
  if (contentType !== "application/json") {
    context.res = {
      status: 400,
      body:
        "WooCommerce webhook processing can only accept application/json messages. Received content type: " +
        contentType,
    };
  } else {
    const resource = req.headers["x-wc-webhook-resource"];
    const event = req.headers["x-wc-webhook-event"];
    const signature = req.headers["x-wc-webhook-signature"];

    if (!resource || !event || !signature) {
      context.res = {
        status: 400,
        body: "One or more of the following required headers are missing in request: x-wc-webhook-resource, x-wc-webhook-event, x-wc-webhook-signature",
      };
    } else {
      const payloadBuffer = Buffer.from(req.rawBody, "utf-8");
      if (isSignatureValid(payloadBuffer, signature)) {
        webhookHandler(resource, event, req.body);
        // Assume webhook successfully received.
        // TODO: validate this assumption.
        context.res = { status: 204 };
      } else {
        context.res = { status: 400, body: "Invalid signature for payload" };
      }
    }
  }
};

export default httpTrigger;
