import 'package:flutter/material.dart';
import 'home_screen.dart'; // Importa a tela principal

class LoginScreen extends StatelessWidget {
  final TextEditingController _loginController = TextEditingController();
  final TextEditingController _senhaController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Bem-vindo!', style: TextStyle(fontSize: 24)),
            SizedBox(height: 20),
            TextField(
              controller: _loginController,
              decoration: InputDecoration(labelText: 'Login'),
            ),
            TextField(
              controller: _senhaController,
              decoration: InputDecoration(labelText: 'Senha'),
              obscureText: true,
            ),
            SizedBox(height: 10),
            TextButton(
              onPressed: () {
                // Adicione aqui a lógica de "esqueceu a senha"
              },
              child: Text('Esqueceu a senha?'),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Lógica de autenticação (simulação)
                if (_loginController.text == 'admin' &&
                    _senhaController.text == 'admin') {
                  // Se o login for válido, navegue para a tela Home
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (context) => HomeScreen(
                        usuario:
                            'NomeDoUsuario', // Aqui você passa o nome do usuário
                      ),
                    ),
                  );
                } else {
                  // Exibe mensagem de erro
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('Login ou senha inválidos'),
                  ));
                }
              },
              child: Text('Entrar'),
            ),
          ],
        ),
      ),
    );
  }
}
