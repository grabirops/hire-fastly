import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  contractId: string;
  onSubmitSuccess: () => void;
}

export default function ReviewForm({
  contractId,
  onSubmitSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Por favor, selecione uma nota.");
      return;
    }
    setIsSubmitting(true);

    // Lógica para chamar a API /api/reviews
    console.log({
      contract_id: contractId,
      rating,
      text,
    });

    // Simulação de chamada de API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    onSubmitSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2 block">Sua Avaliação</Label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={cn(
                "h-8 w-8 cursor-pointer",
                (hoverRating || rating) >= star
                  ? "text-yellow-400"
                  : "text-gray-300"
              )}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="review-text">Comentário (opcional)</Label>
        <Textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Descreva sua experiência com o profissional/empresa..."
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
      </Button>
    </form>
  );
}
