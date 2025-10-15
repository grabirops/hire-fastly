import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFieldArray, useForm } from "react-hook-form";
import { TrashIcon } from "@radix-ui/react-icons";
import { trackEvent } from "@/lib/posthog";

type Milestone = {
  description: string;
  value: number;
  due_date: string;
};

type ContractFormValues = {
  title: string;
  scope: string;
  start_date: string;
  end_date: string;
  milestones: Milestone[];
};

interface ModalContratoProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
}

export default function ModalContrato({
  isOpen,
  onClose,
  proposalId,
}: ModalContratoProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ContractFormValues>({
    defaultValues: {
      title: "Título do Contrato",
      scope: "Escopo detalhado do trabalho...",
      milestones: [{ description: "", value: 0, due_date: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones",
  });

  const onSubmit = async (data: ContractFormValues) => {
    const response = await fetch("/api/contracts", {
      method: "POST",
      body: JSON.stringify({ ...data, proposal_id: proposalId }),
    });

    if (response.ok) {
      const newContract = await response.json();

      trackEvent("proposal_accepted", {
        proposal_id: proposalId,
        job_id: newContract.job_id,
      });

      trackEvent("contract_signed", {
        contract_id: newContract.id,
        job_id: newContract.job_id,
        total_value: newContract.total_value,
        num_milestones: data.milestones.length,
      });

      onClose();
      // Opcional: navegar para a página do contrato
    } else {
      // Tratar erro
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Contrato</DialogTitle>
          <DialogDescription>
            Defina os termos e os marcos de pagamento para este projeto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Contrato</Label>
              <Input
                id="title"
                {...register("title", { required: "Título é obrigatório" })}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>
            {/* Outros campos do contrato como datas, etc. */}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope">Escopo do Projeto</Label>
            <Textarea
              id="scope"
              {...register("scope", { required: "Escopo é obrigatório" })}
            />
            {errors.scope && (
              <p className="text-red-500 text-sm">{errors.scope.message}</p>
            )}
          </div>

          <div>
            <Label className="text-lg font-semibold">Marcos de Pagamento</Label>
            <div className="space-y-4 mt-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input
                    placeholder={`Descrição do Marco ${index + 1}`}
                    {...register(`milestones.${index}.description` as const, {
                      required: true,
                    })}
                    className="flex-grow"
                  />
                  <Input
                    type="number"
                    placeholder="Valor"
                    {...register(`milestones.${index}.value` as const, {
                      required: true,
                      valueAsNumber: true,
                    })}
                    className="w-24"
                  />
                  <Input
                    type="date"
                    {...register(`milestones.${index}.due_date` as const, {
                      required: true,
                    })}
                    className="w-40"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                append({ description: "", value: 0, due_date: "" })
              }
            >
              Adicionar Marco
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Criar Contrato</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
