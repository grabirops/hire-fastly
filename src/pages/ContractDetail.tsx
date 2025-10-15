import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data - replace with actual data fetching
const contract = {
  id: " uuid-contrato-1",
  title: "Desenvolvimento de E-commerce",
  freelancer: "João Silva",
  status: "Ativo",
  totalValue: 5000,
  startDate: "2024-01-10",
  endDate: "2024-03-10",
};

const milestones = [
  {
    id: "uuid-milestone-1",
    description: "Configuração do ambiente e layout inicial",
    value: 1000,
    dueDate: "2024-01-25",
    status: "Aprovado",
  },
  {
    id: "uuid-milestone-2",
    description: "Desenvolvimento do back-end e integrações",
    value: 2500,
    dueDate: "2024-02-20",
    status: "Pago",
  },
  {
    id: "uuid-milestone-3",
    description: "Desenvolvimento do front-end e testes finais",
    value: 1500,
    dueDate: "2024-03-05",
    status: "Pendente",
  },
];

export default function ContractDetail() {
  const handleGeneratePix = (milestoneId: string) => {
    alert(`Gerando PIX para o milestone ${milestoneId}`);
    // Aqui virá a lógica para chamar a API /api/milestones/checkout
  };

  const handleViewStatus = (milestoneId: string) => {
    alert(`Verificando status do milestone ${milestoneId}`);
    // Lógica para verificar o status do pagamento
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Aprovado":
        return "success";
      case "Pago":
        return "info";
      case "Pendente":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                {contract.title}
              </CardTitle>
              <CardDescription>
                Contratado: {contract.freelancer}
              </CardDescription>
            </div>
            <Badge variant="outline">{contract.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <strong>Valor Total:</strong> R${" "}
              {contract.totalValue.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div>
              <strong>Início:</strong>{" "}
              {new Date(contract.startDate).toLocaleDateString("pt-BR")}
            </div>
            <div>
              <strong>Fim:</strong>{" "}
              {new Date(contract.endDate).toLocaleDateString("pt-BR")}
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">Marcos de Pagamento</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milestones.map((milestone) => (
                <TableRow key={milestone.id}>
                  <TableCell>{milestone.description}</TableCell>
                  <TableCell className="text-right">
                    R${" "}
                    {milestone.value.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(milestone.dueDate).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(milestone.status)}>
                      {milestone.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {milestone.status === "Pendente" && (
                      <Button
                        size="sm"
                        onClick={() => handleGeneratePix(milestone.id)}
                      >
                        Gerar Pix
                      </Button>
                    )}
                    {milestone.status === "Pago" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewStatus(milestone.id)}
                      >
                        Ver Status
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
