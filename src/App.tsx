import { useState, useEffect } from "react";
import Database from "@tauri-apps/plugin-sql";
import "./App.css";

function App() {
  const [notaActual, setNotaActual] = useState("");
  const [db, setDb] = useState<Database | null>(null);

  // Inicializar la base de datos SQLite al abrir la app
  useEffect(() => {
    async function initDb() {
      try {
        const database = await Database.load("sqlite:empire_notes.db");
        setDb(database);

        // Crear la tabla de notas si no existe
        await database.execute(
          "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT);"
        );

        // Cargar la última nota guardada
        const result: any[] = await database.select("SELECT content FROM notes ORDER BY id DESC LIMIT 1");
        if (result.length > 0) {
          setNotaActual(result[0].content);
        } else {
          setNotaActual("Escribe tus ideas aquí...");
        }
      } catch (error) {
        console.error("Error al inicializar la base de datos:", error);
      }
    }

    initDb();
  }, []);

  // Función para guardar la nota en SQLite automáticamente al escribir
  const handleNotaChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nuevoTexto = e.target.value;
    setNotaActual(nuevoTexto);

    if (db) {
      try {
        // Guardar o actualizar en la base de datos local
        await db.execute("DELETE FROM notes"); // Mantenemos una nota principal por ahora
        await db.execute("INSERT INTO notes (content) VALUES (?)", [nuevoTexto]);
      } catch (error) {
        console.error("Error al guardar la nota:", error);
      }
    }
  };

  return (
    <div className="container" style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Empire Notes 👑</h1>
        <button 
          onClick={() => alert("Pronto aquí abriremos la ventana flotante.")}
          style={{ padding: "8px 12px", cursor: "pointer", background: "#333", color: "#fff", border: "none", borderRadius: "4px" }}
        >
          🪟 Activar Ventana Flotante
        </button>
      </header>

      <div style={{ display: "flex", gap: "20px" }}>
        {/* Barra lateral de notas */}
        <div style={{ width: "250px", borderRight: "1px solid #ccc", paddingRight: "10px" }}>
          <h3>Mis Libretas</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ padding: "8px", background: "#f0f0f0", borderRadius: "4px", marginBottom: "5px", cursor: "pointer" }}>
              📖 Nota Principal (Guardado Local)
            </li>
          </ul>
        </div>

        {/* Área de edición estilo libreta con SQLite */}
        <div style={{ flex: 1, background: "#fdfbf7", padding: "20px", border: "1px solid #e0dcd5", borderRadius: "8px", minHeight: "400px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          <h3>Página Estilo Libreta</h3>
          <textarea
            value={notaActual}
            onChange={handleNotaChange}
            style={{
              width: "100%",
              height: "300px",
              background: "transparent",
              border: "none",
              resize: "none",
              outline: "none",
              fontSize: "16px",
              lineHeight: "24px",
              backgroundImage: "linear-gradient(#e0dcd5 1px, transparent 1px)",
              backgroundSize: "100% 24px"
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;