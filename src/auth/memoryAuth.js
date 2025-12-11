/**
 * Sistema de autenticación en memoria temporal
 * Para usar mientras la tabla users no está disponible en la base de datos
 */

const bcrypt = require('bcrypt');

class MemoryAuth {
    constructor() {
        this.users = new Map(); // email -> user data
        this.usersById = new Map(); // id -> user data
        this.nextId = 1;
        
        // Inicializar con algunos usuarios de prueba
        this.initializeTestUsers();
    }
    
    initializeTestUsers() {
        console.log('🔧 Inicializando sistema de autenticación en memoria...');
    }
    
    async createUser(userData) {
        const { email, username, password, firstName, lastName } = userData;
        
        // Validaciones básicas
        if (!email || !username || !password) {
            throw new Error('Email, username y password son requeridos');
        }
        
        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        
        // Verificar si el email ya existe
        if (this.users.has(email.toLowerCase())) {
            throw new Error('El email ya está registrado');
        }
        
        // Verificar si el username ya existe
        for (const [email, user] of this.users) {
            if (user.username === username) {
                throw new Error('El username ya está en uso');
            }
        }
        
        // Hash de la contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Crear usuario
        const user = {
            id: this.nextId++,
            email: email.toLowerCase(),
            username,
            password_hash: passwordHash,
            first_name: firstName,
            last_name: lastName,
            role: 'user',
            is_active: true,
            email_verified: false,
            created_at: new Date().toISOString(),
            last_login: null
        };
        
        // Guardar en memoria
        this.users.set(user.email, user);
        this.usersById.set(user.id, user);
        
        console.log(`✅ Usuario creado en memoria: ${user.email} (ID: ${user.id})`);
        
        // Retornar datos sin el hash
        const { password_hash: _, ...userPublic } = user;
        return userPublic;
    }
    
    async authenticateUser(email, password) {
        const user = this.users.get(email.toLowerCase());
        
        if (!user) {
            throw new Error('Credenciales inválidas');
        }
        
        if (!user.is_active) {
            throw new Error('Usuario inactivo');
        }
        
        // Verificar contraseña
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!passwordMatch) {
            throw new Error('Credenciales inválidas');
        }
        
        // Actualizar último login
        user.last_login = new Date().toISOString();
        
        console.log(`✅ Usuario autenticado: ${user.email} (ID: ${user.id})`);
        
        // Retornar datos sin el hash
        const { password_hash: _, ...userPublic } = user;
        return userPublic;
    }
    
    getUserById(id) {
        const user = this.usersById.get(parseInt(id));
        
        if (!user || !user.is_active) {
            return null;
        }
        
        // Retornar datos sin el hash
        const { password_hash: _, ...userPublic } = user;
        return userPublic;
    }
    
    updateUser(id, updates) {
        const user = this.usersById.get(parseInt(id));
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        
        // Actualizar campos permitidos
        const allowedFields = ['first_name', 'last_name', 'username', 'role', 'email_verified'];
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                user[field] = updates[field];
            }
        }
        
        user.updated_at = new Date().toISOString();
        
        console.log(`✅ Usuario actualizado: ${user.email} (ID: ${user.id})`);
        
        // Retornar datos sin el hash
        const { password_hash: _, ...userPublic } = user;
        return userPublic;
    }
    
    getAllUsers() {
        const users = [];
        for (const user of this.users.values()) {
            const { password_hash: _, ...userPublic } = user;
            users.push(userPublic);
        }
        return users;
    }
    
    getUserStats() {
        return {
            totalUsers: this.users.size,
            activeUsers: Array.from(this.users.values()).filter(u => u.is_active).length,
            verifiedUsers: Array.from(this.users.values()).filter(u => u.email_verified).length
        };
    }
    
    // Método para verificar si un usuario existe
    userExists(email) {
        return this.users.has(email.toLowerCase());
    }
    
    // Método para obtener usuario por email
    getUserByEmail(email) {
        const user = this.users.get(email.toLowerCase());
        if (!user) {
            return null;
        }
        
        // Retornar datos sin el hash
        const { password_hash: _, ...userPublic } = user;
        return userPublic;
    }
}

// Crear instancia global
const memoryAuth = new MemoryAuth();

module.exports = memoryAuth;