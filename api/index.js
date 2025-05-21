// Importação dos módulos necessários
const express = require('express') // Framework para criar o servidor web
const fs = require('fs') // Módulo para manipular os arquivos
const path = require('path') // Módulo para trabalhar os caminhos dos arquivos
const cors = require('cors') // Middleware para habilitar o cors

// Inicializando a aplicação Express
const app = express()

// Definindo a porta do servidor
const port = process.env.PORT || 3000

// MIDDLEWARES
// Habilita CORS para permitir requisições de diferentes origens
app.use(cors())
// Configura o Express para interpretar corpo das requisições JSON
app.use(express.json())

// Configuração do arquivo de dados

// Define o caminho completo para o arquivo filmes.json
const filmesPath = path.join(__dirname, 'filmes.json')

// Função para ler e retornar a lista de filmes do arquivo JSON

/*
@returns{Array} // Lista de filmes
*/
const getFilmes = () => {
    try {
        // Verifica se o arquivo existe 
        if (!fs.existsSync(filmesPath)) {
            // Se não existir, cria um arquivo com array vazio
            fs.writeFileSync(filmesPath, '[]')
            return []
        }
        // Lê o conteúdo do arquivo com codificação UTF-8
        const data = fs.readFileSync(filmesPath, 'utf-8')

        //Se o arquivo estiver vazio, retorna array vazio
        if (!data.trim()) return []
        //Converte o conteúdo JSON para objec JavaScript e retorna
        return JSON.parse(data)
    } catch (error) {
        //Em caso de erro, loga no console e retorna array vazio
        console.erro(`Erro ao ler filmes.json ${error}`);
        return []

    }
}

//Rotas da API
//Rota GET - Retorna todos os filmes
app.get('/api/filmes', (req, res) => {
    try {
        //obtem a lista de filmes
        const filmes = getFilmes()

        //Retorna a lista como JSON
        res.json(filmes)
    } catch (error) {
        // Em caso de erro, retorna statos 500 (Internal Server Error)
        res.status(500).json({ error: 'Erro ao buscar filmes' })
    }
})

// Rota GET para buscar filmes pelo ID
app.get('/api/filmes/:id', (req, res) => {
    try {
        // Extrai o ID dos parâmetros da URL
        const { id } = req.params;
        // Obtém a lista de filmes
        const filmes = getFilmes();
        // Busca o filme com o ID correspondente
        const filme = filmes.find(f => f.id == id);

        if (filme) {
            // Se encontrou, retorna o filme
            res.json(filme);
        } else {
            // Se não encontrou, retorna status 404 (Not Found)
            res.status(404).json({ error: "Filme não encontrado" });
        }
    } catch (error) {
        // Em caso de erro, retorna status 500 (Internal Server Error)
        res.status(500).json({ error: 'Erro ao buscar filme' });
    }
});

//Rota POST
app.post('/api/filmes', (req, res) => {
    try {
      // Extrai os dados do corpo da requisição
      const { titulo, ano, genero } = req.body;
      
      // Valida se todos os campos foram fornecidos
      if (!titulo || !ano || !genero) {
        return res.status(400).json({ error: "Preencha todos os campos" });
      }
  
      // Obtém a lista atual de filmes
      const filmes = getFilmes();
      
      // Cria um novo filme com ID incremental
      const novoFilme = {
        id: filmes.length > 0 ? Math.max(...filmes.map(f => f.id)) + 1 : 1,
        titulo,
        ano,
        genero
      };
      
      // Adiciona o novo filme à lista
      filmes.push(novoFilme);
      
      // Salva a lista atualizada no arquivo JSON
      fs.writeFileSync(filmesPath, JSON.stringify(filmes, null, 2));
      
      // Retorna o novo filme com status 201 (Created)
      res.status(201).json(novoFilme);
    } catch (error) {
      // Em caso de erro, retorna status 500 (Internal Server Error)
      res.status(500).json({ error: 'Erro ao adicionar filme' });
    }
  });
  

//Rota DELETE
app.delete('/api/filmes/:id', (req, res) => {
    try {
        // Extrai o ID dos parâmetros da URL
        const { id } = req.params;

        // Obtém a lista atual de filmes
        let filmes = getFilmes();
        const initialLength = filmes.length;

        // Filtra a lista, removendo o filme com o ID especificado
        filmes = filmes.filter(f => f.id != id);

        // Verifica se algum filme foi removido
        if (filmes.length === initialLength) {
            return res.status(404).json({ error: "Filme não encontrado" });
        }

        // Salva a lista atualizada no arquivo JSON
        fs.writeFileSync(filmesPath, JSON.stringify(filmes, null, 2));

        // Retorna status 204 (No Content) para indicar sucesso sem retorno
        res.status(204).send();
    } catch (error) {
        // Em caso de erro, retorna status 500 (Internal Server Error)
        res.status(500).json({ error: 'Erro ao remover filme' });
    }
})

//Middleware de reddo Global
//Middleware para tratar erros não capturados
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500), json({ error: 'Erro interno do servidor' })
})

//Inicialização do servidor
//Inicia o servidor na porta especificada
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Arquivo de dados em: ${filmesPath}`);
})