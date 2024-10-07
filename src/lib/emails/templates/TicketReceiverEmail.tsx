import { Body, Button, Container, Head, Hr, Html, Img, Preview, render, Section, Text } from "@react-email/components";
import * as React from "react";

interface TicketReceiverProps {
  eventName: string;
  ticketUrls: string[];
  imageUrl: string | null;
  tokenIds: string[] | null;
}

const TicketReceiverEmailTemplate = ({ eventName, ticketUrls, imageUrl, tokenIds }: TicketReceiverProps) => {
  const ticketWord = tokenIds.length > 1 ? "tickets" : "ticket"
  return (
    <Html>
      <Head />
      <Preview>
        You just received the {ticketWord} for {eventName}
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
          <Text style={paragraph}>Great news, your are blessed! The {eventName} team has sent you the {ticketWord}.</Text>
          <Text style={paragraph}>To make things easier for you, we’ve created an account on your behalf, where your ticket(s) is securely held. Simply log in to access your ticket and get ready for the event.</Text>
          <Section style={btnContainer}>
            {/*// 🏗️ TODO: add column url to App model, so we can use it here */}
            {ticketUrls.map((url, index) => (
              <Button style={button} href={url} key={url}>
                Access your ticket {ticketUrls.length > 1 ? `#${index+1}` : ""}
              </Button>
            ))}
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
  padding: "12px",
  marginBottom: "8px"
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0"
};

const footer = {
  color: "#8898aa",
  fontSize: "12px"
};

const renderTicketReceiverEmail = async ({ eventName, ticketUrls, imageUrl, tokenIds }) => {
  return await render(
    <TicketReceiverEmailTemplate
      eventName={eventName}
      ticketUrls={ticketUrls}
      imageUrl={imageUrl}
      tokenIds={tokenIds}
    />
  );
};

export default renderTicketReceiverEmail;
