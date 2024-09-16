import { NameAndDescriptionField } from "@/components/createDashboard/createDashboardContent/customFields/NameAndDescriptionField";

export const createDashboardSidebarCategoriesAndFields = [
  {
    id: "setup",
    name: "Set up",
    description: "Get everything in place to kick things off.",
    icon: "/img/icons/heart.svg",
    tabs: [
      {
        name: "API key",
        href: "api-key",
        fields: [
          {
            id: "api-key",
            name: "API key",
            type: "text"
          }
        ]
      },
      {
        name: "Name and description",
        href: "name-and-description",
        primary: true,
        customFieldComponents: [NameAndDescriptionField],
        fields: []
      },
      {
        name: "Date and time",
        href: "date-and-time",
        fields: [
          {
            id: "date",
            name: "Date",
            type: "date",
            required: true,
          }
        ]
      },
      {
        name: "Ticket type",
        href: "ticket-type",
        fields: [
          {
            id: "ticket-type",
            name: "Ticket type",
            type: "select"
          }
        ]
      }
    ]
  },
  {
    id: "customize",
    name: "Customize",
    description: "Fine-tune to your liking easily as a piece of cake",
    icon: "/img/icons/cake.svg",
    tabs: [
      {
        name: "Ticket design",
        href: "ticket-design",
        fields: [],
        primary: true
      },
      {
        name: "Payment methods",
        href: "payment-methods",
        fields: []
      },
      {
        name: "Discounts and promo codes",
        href: "discounts-and-promo-codes",
        fields: []
      }
    ]
  },
  {
    id: "publish",
    name: "Publish",
    description: "Publish and go live ASAP",
    icon: "/img/icons/rocket.svg",
    tabs: [
      {
        name: "Publish date",
        href: "publish-date",
        fields: [],
        primary: true
      },
      {
        name: "API Endpoints",
        href: "api-endpoints",
        fields: []
      },
      {
        name: "Preview",
        href: "preview",
        fields: []
      },
      {
        name: "Distribution channels",
        href: "distribution-channels",
        fields: []
      }
    ]
  }
];