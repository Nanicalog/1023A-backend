import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import mysql from 'mysql2/promise';

// Criação da aplicação
const app = fastify();

// Registro do CORS
await app.register(cors);

// Criação do pool de conexões (reutilizável)
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "listagem_produtos",
    port: 3306
});

// Rota de teste
app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send("Fastify funcionando");
});

// Rota para listar todos os produtos
app.get('/lista', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const [produtos] = await pool.query("SELECT * FROM lista");
        reply.status(200).send(produtos);
    } catch (erro: any) {
        console.error(erro);
        reply.status(500).send({ mensagem: "Erro ao buscar produtos" });
    }
});

// Rota para adicionar um produto
interface Produto {
    id: number;
    nome: string;
}

app.post('/produtos', async (request: FastifyRequest<{ Body: Produto }>, reply: FastifyReply) => {
    const { id, nome } = request.body;

    try {
        const [resultado] = await pool.query(
            "INSERT INTO lista (id, nome) VALUES (?, ?)",
            [id, nome]
        );
        reply.status(201).send({ mensagem: "Produto adicionado com sucesso", resultado });
    } catch (erro: any) {
        console.error(erro);

        let mensagem = "Erro ao inserir produto";

        if (erro.code === "ER_DUP_ENTRY") {
            mensagem = "ID duplicado: já existe um produto com esse ID";
        } else if (erro.code === "ER_NO_SUCH_TABLE") {
            mensagem = "A tabela 'lista' não existe no banco";
        }

        reply.status(400).send({ mensagem });
    }
});

// Inicialização do servidor
const start = async () => {
    try {
        await app.listen({ port: 8000 });
        console.log("Servidor rodando em http://localhost:8000");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
