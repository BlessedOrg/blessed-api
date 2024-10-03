import { Body, Container, Head, Hr, Html, Img, Preview, render, Section, Text } from "@react-email/components";
import * as React from "react";

interface TicketReceiverProps {
  eventName: string;
  ticketUrl: string | null;
  imageUrl: string | null;
}

const TicketReceiverEmailTemplate = ({ eventName, ticketUrl, imageUrl }: TicketReceiverProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        You just received the ticket for {eventName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {imageUrl && (
            <Img
              src={imageUrl}
              alt={`${eventName} logo`}
              style={logo}
            />
          )}
          <Text style={paragraph}>Hello there!</Text>
          <Text style={paragraph}>Great news, your are blessed! The {eventName} team has sent you the ticket.</Text>
          <Text style={paragraph}>To make things easier for you, we’ve created an account on your behalf, where your ticket is securely held. Simply log in to access your ticket and get ready for the event.</Text>
          <Section style={btnContainer}>
            {/*// 🏗️ TODO: add column url to App model, so we can use it here */}
            {/*<Button style={button} href={ticketUrl}>*/}
            {/*  Access your ticket*/}
            {/*</Button>*/}
          </Section>
          <Text style={paragraph}>
            Tons of fun at the event
            <br />
            Your blessed.fan team
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Blessed magic unfolds today, shapes tomorrow
          </Text>
        </Container>
      </Body>
    </Html>
  )
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    "-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Oxygen-Sans,Ubuntu,Cantarell,\"Helvetica Neue\",sans-serif"
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px"
};

const logo = {
  margin: "0 auto",
  maxWidth: "100px"
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px"
};

const btnContainer = {
  textAlign: "center" as const
};

const button = {
  backgroundColor: "#5F51E8",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px"
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0"
};

const footer = {
  color: "#8898aa",
  fontSize: "12px"
};

const renderTicketReceiverEmail = async ({ eventName, ticketUrl, imageUrl }) => {
  return await render(
    <TicketReceiverEmailTemplate
      eventName={eventName}
      ticketUrl={ticketUrl}
      imageUrl={imageUrl}
    />
  );
};

export default renderTicketReceiverEmail;
