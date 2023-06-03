import { OrderStatus } from "~/constants/order";
import { CartItem } from "~/models/CartItem";
import { Order } from "~/models/Order";
import { AvailableProduct, Product } from "~/models/Product";

export const products: Product[] = [
  {
    description:
      "Taking place in the year 2057, the story follows a group of astronauts on a dangerous mission to reignite the dying Sun.",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    price: 18.4,
    title: "Sunshine",
  },
  {
    description:
      "Set in a dystopian future where humanity is struggling to survive, the film follows a group of astronauts who travel through a wormhole near Saturn in search of a new home for humanity.",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a0",
    price: 10,
    title: "Interstellar",
  },
  {
    description:
      "Centers on the crew of the spaceship Prometheus as it follows a star map discovered among the artifacts of several ancient Earth cultures.",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a2",
    price: 23,
    title: "Prometheus",
  },
  {
    description:
      "The film depicts an astronaut's (Damon) lone struggle to survive on Mars after being left behind, and the efforts of NASA to rescue him and bring him home to Earth.",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
    price: 15,
    title: "The Martian",
  },
  {
    description:
      "The film takes place in a future where most of Europe is invaded by an alien race.",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
    price: 23,
    title: "Edge of Tomorrow",
  },
  {
    description:
      "The film follows a man who experiences a personal crisis as he nears the end of a three-year solitary stint mining helium-3 on the far side of the Moon.",
    id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
    price: 15,
    title: "Moon",
  },
  {
    description:
      "The film follows a linguist enlisted by the United States Army to discover how to communicate with extraterrestrial aliens who have arrived on Earth, before tensions lead to war.",
    id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
    price: 23,
    title: "Arrival",
  },
  {
    description:
      " The film is set in a dystopian future Los Angeles of 2019, in which synthetic humans known as replicants are bio-engineered by the powerful Tyrell Corporation to work at space colonies.",
    id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
    price: 15,
    title: "Blade Runner",
  },
];

export const availableProducts: AvailableProduct[] = products.map(
  (product, index) => ({
    ...product,
    count: index + 1,
  })
);

export const cart: CartItem[] = [
  {
    product: {
      description:
        "Taking place in the year 2057, the story follows a group of astronauts on a dangerous mission to reignite the dying Sun.",
      id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
      price: 18.4,
      title: "Sunshine",
    },
    count: 2,
  },
  {
    product: {
      description:
        "The film follows a linguist enlisted by the United States Army to discover how to communicate with extraterrestrial aliens who have arrived on Earth, before tensions lead to war.",
      id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
      price: 23,
      title: "Arrival",
    },
    count: 5,
  },
];

export const orders: Order[] = [
  {
    id: "1",
    address: {
      address: "some address",
      firstName: "Name",
      lastName: "Surname",
      comment: "",
    },
    items: [
      { productId: "7567ec4b-b10c-48c5-9345-fc73c48a80aa", count: 2 },
      { productId: "7567ec4b-b10c-48c5-9445-fc73c48a80a2", count: 5 },
    ],
    statusHistory: [
      { status: OrderStatus.Open, timestamp: Date.now(), comment: "New order" },
    ],
  },
  {
    id: "2",
    address: {
      address: "another address",
      firstName: "John",
      lastName: "Doe",
      comment: "Ship fast!",
    },
    items: [{ productId: "7567ec4b-b10c-48c5-9345-fc73c48a80aa", count: 3 }],
    statusHistory: [
      {
        status: OrderStatus.Sent,
        timestamp: Date.now(),
        comment: "Fancy order",
      },
    ],
  },
];
