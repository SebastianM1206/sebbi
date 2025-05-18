from supabaseConnection.client import get_supabase_client
from typing import Dict, Optional
import hashlib
import secrets

class SupabaseService:
    def __init__(self):
        self.client = get_supabase_client()
    
    def _hash_password(self, password: str, salt: Optional[str] = None) -> tuple:
        """Hash a password for storing."""
        if salt is None:
            salt = secrets.token_hex(16)
        pwdhash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return salt, pwdhash.hex()
    
    def _verify_password(self, stored_password: str, provided_password: str, salt: str) -> bool:
        """Verify a stored password against one provided by user"""
        _, new_pwdhash = self._hash_password(provided_password, salt)
        return stored_password == new_pwdhash
    
    async def register_user(self, name: str, email: str, password: str) -> Dict:
        """
        Registra un nuevo usuario
        """
        try:
            # Verificar si el usuario ya existe
            result = self.client.table("users").select("*").eq("email", email).execute()
            if result.data:
                raise Exception("El email ya está registrado")
            
            # Hashear la contraseña
            salt, hashed_password = self._hash_password(password)
            
            # Insertar usuario en la base de datos
            data = {
                "name": name,
                "email": email,
                "password": f"{salt}:{hashed_password}",
                "created_at": "now()"
            }
            
            result = self.client.table("users").insert(data).execute()
            
            if not result.data:
                raise Exception("Error al registrar usuario")
                
            user_data = result.data[0]
            return {
                "user_id": user_data["user_id"],
                "name": user_data["name"],
                "email": user_data["email"],
                "created_at": user_data["created_at"]
            }
        except Exception as e:
            raise Exception(f"Error en Supabase: {str(e)}")
    
    async def login_user(self, email: str, password: str) -> Dict:
        """
        Autentica a un usuario
        """
        try:
            # Buscar el usuario
            result = self.client.table("users").select("*").eq("email", email).execute()
            
            if not result.data:
                raise Exception("Credenciales inválidas")
            
            user_data = result.data[0]
            stored_password = user_data["password"]
            
            # Verificar formato correcto
            if ":" not in stored_password:
                raise Exception("Formato de contraseña incorrecto")
                
            salt, hashed_password = stored_password.split(":")
            
            # Verificar contraseña
            if not self._verify_password(hashed_password, password, salt):
                raise Exception("Credenciales inválidas")
            
            # Generar token JWT (podríamos usar PyJWT, pero por simplicidad generaremos un token simple)
            access_token = secrets.token_hex(32)
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "user_id": user_data["user_id"],
                    "name": user_data["name"],
                    "email": user_data["email"],
                    "created_at": user_data["created_at"]
                }
            }
        except Exception as e:
            raise Exception(f"Error en Supabase: {str(e)}")

supabase_service = SupabaseService()
