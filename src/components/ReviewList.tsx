import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

// Mock data - replace with actual data fetching hook (e.g., useQuery)
const mockReviews = [
  {
    id: "uuid-review-1",
    rating: 5,
    text: "Excelente profissional, entregou tudo no prazo e com muita qualidade. Recomendo!",
    author: {
      name: "Empresa Inovadora S.A.",
    },
    created_at: "2024-03-12T10:00:00Z",
  },
  {
    id: "uuid-review-2",
    rating: 4,
    text: "Bom trabalho, a comunicação foi um pouco lenta no início mas depois fluiu bem.",
    author: {
      name: "Startup Ágil",
    },
    created_at: "2024-02-20T15:30:00Z",
  },
];

interface ReviewListProps {
  userId: string;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <StarIcon
        key={star}
        className={cn(
          "h-5 w-5",
          rating >= star ? "text-yellow-400" : "text-gray-300"
        )}
      />
    ))}
  </div>
);

export default function ReviewList({ userId }: ReviewListProps) {
  // const { data: reviews, isLoading } = useQuery(...) -> Lógica de fetch real
  const reviews = mockReviews;
  const isLoading = false;

  if (isLoading) {
    return <div>Carregando avaliações...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return <p>Este usuário ainda não recebeu avaliações.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliações Recebidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-4 last:border-b-0">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{review.author.name}</span>
              <StarRating rating={review.rating} />
            </div>
            <p className="text-gray-600">{review.text}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(review.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
