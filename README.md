# Minecraft Bedrock AddonsHub

Portal completo para compartilhamento de addons do Minecraft Bedrock Edition com API REST e banco PostgreSQL.

## 🚀 Como executar

### 1. Configurar o banco de dados PostgreSQL

Certifique-se de ter o PostgreSQL rodando localmente e configure a connection string no arquivo `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/minecraft_addons?schema=public"
```

### 2. Instalar dependências e configurar banco

```bash
npm install
npm run db:generate
npm run db:push
```

### 3. Executar o projeto completo

```bash
npm run dev:full
```

Isso irá iniciar:
- Frontend (Vite) em `http://localhost:5173`
- API (Express) em `http://localhost:3001`

### 4. Ou executar separadamente

**Frontend:**
```bash
npm run dev
```

**API:**
```bash
npm run server
```

**API com hot reload:**
```bash
npm run server:dev
```

## 🗄️ Banco de dados

### Comandos úteis:

```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar mudanças no schema
npm run db:push

# Criar e aplicar migrations
npm run db:migrate

# Abrir Prisma Studio
npm run db:studio
```

## 🔐 Variáveis de ambiente

Configure no arquivo `.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/minecraft_addons?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil do usuário logado

### Addons
- `GET /api/addons` - Lista addons com filtros
- `GET /api/addons/:id` - Detalhes de um addon
- `POST /api/addons` - Criar addon (autenticado)
- `PUT /api/addons/:id` - Editar addon (apenas autor)
- `DELETE /api/addons/:id` - Deletar addon (apenas autor)
- `PATCH /api/addons/:id/views` - Incrementar visualizações
- `PATCH /api/addons/:id/downloads` - Incrementar downloads

### Users
- `GET /api/users/:id` - Perfil público de usuário
- `GET /api/users/:id/addons` - Addons de um usuário
- `PUT /api/users/:id` - Atualizar perfil (autenticado)

## 🛡️ Segurança

- Autenticação JWT
- Rate limiting
- Helmet para headers de segurança
- Validação de dados com Joi
- CORS configurado
- Proteção de rotas por autor
- Hash de senhas com bcrypt

## 🏗️ Estrutura do projeto

```
├── src/                    # Frontend React
├── server/                 # API Express
│   ├── routes/            # Rotas da API
│   ├── middleware/        # Middlewares
│   └── config/           # Configurações
├── prisma/               # Schema do banco
└── .env                 # Variáveis de ambiente
```

## 🎯 Funcionalidades

- ✅ Sistema completo de autenticação
- ✅ CRUD de addons com proteção por autor
- ✅ Sistema de visualizações e downloads
- ✅ Filtros e busca avançada
- ✅ Perfis de usuário
- ✅ Dashboard administrativo
- ✅ Upload de addons com validação
- ✅ API REST completa
- ✅ Banco PostgreSQL com Prisma