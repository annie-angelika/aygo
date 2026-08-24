export type LegalSection = { heading: string; body: string[] };

export type LegalDoc = {
  title: string;
  updated: string;
  sections: LegalSection[];
};

const UPDATED = "August 24, 2026";
const CONTACT = "hello@aygo.app";

export const TERMS: LegalDoc = {
  title: "Terms of Use",
  updated: UPDATED,
  sections: [
    {
      heading: "Acceptance",
      body: [
        "aygo is a small events app based in Bolivia. Hosts publish events, guests register to attend, and everyone collects passport stamps (we call them aygos) along the way.",
        "By creating an account or using aygo you agree to these Terms and to our Privacy Policy. If you don't agree, please don't use the app.",
      ],
    },
    {
      heading: "Accounts & eligibility",
      body: [
        "You sign in through Pollar, a social login provider. You're responsible for keeping that account secure and for everything that happens under it.",
        "Keep your profile information accurate. Some events are age-restricted; you must be 18 or older to register for those, and hosts may ask for ID at the door.",
      ],
    },
    {
      heading: "Hosting events",
      body: [
        "If you host an event, you're responsible for it: the venue, permits, safety, age limits, and anything you promise to guests. Describe your event honestly and keep the details up to date.",
        "You may not publish events that are illegal, hateful, or discriminatory, that offer sexual services, that sell drugs, or that are scams or misleading in any way.",
        "aygo may edit, hide, or remove any event, and may restrict hosting privileges, at our discretion and without notice.",
      ],
    },
    {
      heading: "Attending events",
      body: [
        "Registering for an event tells the host you're coming. Some hosts require approval, and they may decline or remove guests for any reason.",
        "aygo doesn't run the events and can't guarantee that an event will happen, look like its description, or admit you. If something goes wrong, contact the host first.",
        "aygo does not process payments. If an event has a price, you settle it directly with the host (for example at the door), and that transaction is between you and the host.",
      ],
    },
    {
      heading: "Content & conduct",
      body: [
        "You own what you post (event descriptions, images, messages), and you give aygo a license to show it inside the app so the service can work.",
        "Be decent. No harassment, impersonation, spam, or posting anything you don't have the right to share. Treat hosts and guests the way you'd want to be treated at a party.",
      ],
    },
    {
      heading: "Reports & moderation",
      body: [
        "You can report an event, message, or person from inside the app. Reports go to aygo admins, who may remove content, warn users, or suspend accounts.",
        "We try to be fair, but moderation decisions are ours to make and we can't promise to review every report or explain every outcome.",
      ],
    },
    {
      heading: "Termination",
      body: [
        "You can stop using aygo at any time and ask us to delete your account by emailing us.",
        "We may suspend or close accounts that break these Terms, put other people at risk, or abuse the service, with or without notice.",
      ],
    },
    {
      heading: "Disclaimers & liability",
      body: [
        "aygo is provided as is, without warranties of any kind. We don't guarantee the app will always be available, error-free, or that events listed on it are safe or as described.",
        "To the fullest extent allowed by law, aygo isn't liable for any loss, injury, or damage arising from events you host or attend, from other users' conduct, or from your use of the app.",
      ],
    },
    {
      heading: "Changes",
      body: [
        "We may update these Terms as the app evolves. When we do, we'll change the date at the top; continuing to use aygo after that means you accept the new version.",
      ],
    },
    {
      heading: "Contact",
      body: [`Questions about these Terms? Write to us at ${CONTACT}.`],
    },
  ],
};

export const PRIVACY: LegalDoc = {
  title: "Privacy Policy",
  updated: UPDATED,
  sections: [
    {
      heading: "What we collect",
      body: [
        "When you sign in, your login provider (Pollar) shares your name, email address, and avatar with us. That becomes your aygo profile.",
        "As you use the app we store the events you create and register for, your preferences (like interests and city), any messages you send, and any reports you file.",
        "We set one browser cookie to keep you signed in. We don't collect precise location unless you use a map feature, and we don't run advertising trackers.",
      ],
    },
    {
      heading: "How we use it",
      body: [
        "We use your information to run aygo: show you events, let hosts know who's coming, deliver messages, award passport stamps, and keep your session alive.",
        "We also use it to keep the app safe (reviewing reports and moderating content) and to fix bugs. We don't sell your data.",
      ],
    },
    {
      heading: "Cookies",
      body: [
        "The aygo_session cookie is essential: it's how the app knows who you are between page loads. Clearing it signs you out.",
        "We don't use analytics or advertising cookies.",
      ],
    },
    {
      heading: "Sharing",
      body: [
        "Hosts can see the names and avatars of guests registered for their events. Other guests may see your name and avatar on an event's guest list.",
        "aygo admins can see reports, including the content reported and who filed them, in order to act on them.",
        "We rely on a few providers to run the service: Pollar for sign-in, Neon for database hosting (Postgres), and OpenStreetMap Nominatim for place search when you type a location. Each receives only what's needed to do its job.",
      ],
    },
    {
      heading: "Retention & deletion",
      body: [
        "We keep your data while your account is active. Past events and stamps stay in your passport so your history is preserved.",
        `To delete your account and the personal data tied to it, email ${CONTACT} from the address you signed in with. We'll remove it within a reasonable time, except where we need to keep records for safety or legal reasons.`,
      ],
    },
    {
      heading: "Your rights",
      body: [
        "You can view and edit your profile and preferences in Settings at any time.",
        "You can ask us for a copy of your data, ask us to correct it, or ask us to delete it. Email us and we'll help.",
      ],
    },
    {
      heading: "Children",
      body: [
        "aygo isn't intended for children under 13, and we don't knowingly collect their data. If you believe a child has an account, tell us and we'll remove it.",
      ],
    },
    {
      heading: "Changes",
      body: [
        "We may update this policy as the app changes. We'll update the date at the top, and for significant changes we'll let you know inside the app.",
      ],
    },
    {
      heading: "Contact",
      body: [`Privacy questions or requests? Write to us at ${CONTACT}.`],
    },
  ],
};
