import { useState, useEffect } from "react";
import Database from "@tauri-apps/plugin-sql";
import "./App.css";

function App() {
  const [notaActual, setNotaActual] = useState("Cargando nota...");
  const [db, setDb] = useState<Database | null>(null);

  // 1. Inicializar SQLite
  useEffect(() => {
    async function initDb() {
      try {
        console.log("Conectando a SQLite...");
        // Cargar o crear el archivo de base de datos
        const database = await Database.load("sqlite:empire_notes.db");
        setDb(database);

        // Crear la tabla si no existe
        await database.execute(
          "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT);"
        );
        console.log("Tabla 'notes' lista.");

        // Cargar la nota más reciente
        const result: any[] = await database.select(
          "SELECT content FROM notes ORDER BY id DESC LIMIT 1"
        );

        if (result && result.length > 0) {
          setNotaActual(result[0].content);
        } else {
          setNotaActual("Escribe tus ideas aquí...");
        }
      } catch (error) {
        console.error("Error al inicializar la base de datos:", error);
        setNotaActual("Error al cargar la base de datos.");
      }
    }

    initDb();
  }, []);

  // 2. Guardar nota al escribir
  const handleNotaChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nuevoTexto = e.target.value;
    setNotaActual(nuevoTexto);

    if (db) {
      try {
        await db.execute("DELETE FROM notes;");
        await db.execute("INSERT INTO notes (content) VALUES (?);", [nuevoTexto]);
        console.log("Nota guardada en SQLite:", nuevoTexto);
      } catch (error) {
        console.error("Error al guardar en SQLite:", error);
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
        <div style={{ width: "250px", borderRight: "1px solid #ccc", paddingRight: "10px" }}>
          <h3>Mis Libretas</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ padding: "8px", background: "#f0f0f0", borderRadius: "4px", marginBottom: "5px", cursor: "pointer" }}>
              📖 Nota Principal
            </li>
          </ul>
        </div>

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