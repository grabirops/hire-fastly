import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <img
        src="/placeholder.svg" // Idealmente, uma ilustração 404 customizada
        alt="Página não encontrada"
        className="h-64 w-64 mb-8 text-gray-400"
      />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Oops! Página Não Encontrada.
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Parece que o caminho que você tentou acessar não existe.
      </p>
      <Button asChild>
        <Link to="/">Voltar para a Página Inicial</Link>
      </Button>
    </div>
  );
}
