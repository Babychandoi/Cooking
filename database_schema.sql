--
-- PostgreSQL database dump
--

\restrict lNXa6x6y7r5fyp1kA4P77bc0a6lbHalyhyCyponh4NtiakMT0Ddx0SCQga1IOsa

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: orders_status_enum; Type: TYPE; Schema: public; Owner: phong
--

CREATE TYPE public.orders_status_enum AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public.orders_status_enum OWNER TO phong;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: phong
--

CREATE TYPE public.users_role_enum AS ENUM (
    'ADMIN',
    'USER'
);


ALTER TYPE public.users_role_enum OWNER TO phong;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: dishes; Type: TABLE; Schema: public; Owner: phong
--

CREATE TABLE public.dishes (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL,
    image_url character varying,
    deleted_at timestamp without time zone
);


ALTER TABLE public.dishes OWNER TO phong;

--
-- Name: dishes_id_seq; Type: SEQUENCE; Schema: public; Owner: phong
--

CREATE SEQUENCE public.dishes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dishes_id_seq OWNER TO phong;

--
-- Name: dishes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: phong
--

ALTER SEQUENCE public.dishes_id_seq OWNED BY public.dishes.id;


--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: phong
--

CREATE TABLE public.ingredients (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    unit character varying(20) NOT NULL,
    stock numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    version integer NOT NULL
);


ALTER TABLE public.ingredients OWNER TO phong;

--
-- Name: ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: phong
--

CREATE SEQUENCE public.ingredients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingredients_id_seq OWNER TO phong;

--
-- Name: ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: phong
--

ALTER SEQUENCE public.ingredients_id_seq OWNED BY public.ingredients.id;


--
-- Name: order_item_ingredients; Type: TABLE; Schema: public; Owner: phong
--

CREATE TABLE public.order_item_ingredients (
    id integer NOT NULL,
    order_item_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit character varying(20) NOT NULL,
    "isRestored" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.order_item_ingredients OWNER TO phong;

--
-- Name: order_item_ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: phong
--

CREATE SEQUENCE public.order_item_ingredients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_item_ingredients_id_seq OWNER TO phong;

--
-- Name: order_item_ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: phong
--

ALTER SEQUENCE public.order_item_ingredients_id_seq OWNED BY public.order_item_ingredients.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: phong
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    dish_id integer NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    recipe_version integer NOT NULL
);


ALTER TABLE public.order_items OWNER TO phong;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: phong
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO phong;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: phong
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: phong
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    "customerName" character varying(100),
    "tableNumber" integer,
    status public.orders_status_enum DEFAULT 'PENDING'::public.orders_status_enum NOT NULL,
    "totalPrice" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    note text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.orders OWNER TO phong;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: phong
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO phong;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: phong
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: recipe_items; Type: TABLE; Schema: public; Owner: phong
--

CREATE TABLE public.recipe_items (
    id integer NOT NULL,
    recipe_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit character varying(20) NOT NULL
);


ALTER TABLE public.recipe_items OWNER TO phong;

--
-- Name: recipe_items_id_seq; Type: SEQUENCE; Schema: public; Owner: phong
--

CREATE SEQUENCE public.recipe_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipe_items_id_seq OWNER TO phong;

--
-- Name: recipe_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: phong
--

ALTER SEQUENCE public.recipe_items_id_seq OWNED BY public.recipe_items.id;


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: phong
--

CREATE TABLE public.recipes (
    id integer NOT NULL,
    dish_id integer NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.recipes OWNER TO phong;

--
-- Name: recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: phong
--

CREATE SEQUENCE public.recipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipes_id_seq OWNER TO phong;

--
-- Name: recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: phong
--

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: phong
--

CREATE TABLE public.users (
    id integer NOT NULL,
    "fullName" character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying NOT NULL,
    phone character varying(20),
    role public.users_role_enum DEFAULT 'USER'::public.users_role_enum NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO phong;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: phong
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO phong;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: phong
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: dishes id; Type: DEFAULT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.dishes ALTER COLUMN id SET DEFAULT nextval('public.dishes_id_seq'::regclass);


--
-- Name: ingredients id; Type: DEFAULT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.ingredients ALTER COLUMN id SET DEFAULT nextval('public.ingredients_id_seq'::regclass);


--
-- Name: order_item_ingredients id; Type: DEFAULT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.order_item_ingredients ALTER COLUMN id SET DEFAULT nextval('public.order_item_ingredients_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: recipe_items id; Type: DEFAULT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.recipe_items ALTER COLUMN id SET DEFAULT nextval('public.recipe_items_id_seq'::regclass);


--
-- Name: recipes id; Type: DEFAULT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: order_items PK_005269d8574e6fac0493715c308; Type: CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY (id);


--
-- Name: order_item_ingredients PK_50e7b0b3033b141f9e954b3c8ba; Type: CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.order_item_ingredients
    ADD CONSTRAINT "PK_50e7b0b3033b141f9e954b3c8ba" PRIMARY KEY (id);


--
-- Name: orders PK_710e2d4957aa5878dfe94e4ac2f; Type: CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY (id);


--
-- Name: recipes PK_8f09680a51bf3669c1598a21682; Type: CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT "PK_8f09680a51bf3669c1598a21682" PRIMARY KEY (id);


--
-- Name: ingredients PK_9240185c8a5507251c9f15e0649; Type: CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT "PK_9240185c8a5507251c9f15e0649" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: recipe_items PK_daec78e42198e9c42e1fed60eec; Type: CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.recipe_items
    ADD CONSTRAINT "PK_daec78e42198e9c42e1fed60eec" PRIMARY KEY (id);


--
-- Name: dishes PK_f4748c8e8382ad34ef517520b7b; Type: CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.dishes
    ADD CONSTRAINT "PK_f4748c8e8382ad34ef517520b7b" PRIMARY KEY (id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: order_items FK_145532db85752b29c57d2b7b1f1; Type: FK CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_item_ingredients FK_19b5828f840851203fcb9c8250c; Type: FK CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.order_item_ingredients
    ADD CONSTRAINT "FK_19b5828f840851203fcb9c8250c" FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id);


--
-- Name: recipe_items FK_2de4c7251ed3dd16f2f96ce45ed; Type: FK CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.recipe_items
    ADD CONSTRAINT "FK_2de4c7251ed3dd16f2f96ce45ed" FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_items FK_52bc3d4a9052935fbcf88fcc735; Type: FK CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.recipe_items
    ADD CONSTRAINT "FK_52bc3d4a9052935fbcf88fcc735" FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id);


--
-- Name: recipes FK_79419fe14c32f83cc2a48d7ca27; Type: FK CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT "FK_79419fe14c32f83cc2a48d7ca27" FOREIGN KEY (dish_id) REFERENCES public.dishes(id);


--
-- Name: order_item_ingredients FK_9eedd51b57926c1df863ebf7239; Type: FK CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.order_item_ingredients
    ADD CONSTRAINT "FK_9eedd51b57926c1df863ebf7239" FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE CASCADE;


--
-- Name: order_items FK_ee9bb257017dd6202e7c95ef5fe; Type: FK CONSTRAINT; Schema: public; Owner: phong
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_ee9bb257017dd6202e7c95ef5fe" FOREIGN KEY (dish_id) REFERENCES public.dishes(id);


--
-- PostgreSQL database dump complete
--

\unrestrict lNXa6x6y7r5fyp1kA4P77bc0a6lbHalyhyCyponh4NtiakMT0Ddx0SCQga1IOsa

