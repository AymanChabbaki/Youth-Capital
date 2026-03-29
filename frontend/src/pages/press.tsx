import { useLanguage } from "@/hooks/use-language";
import { Card, Badge } from "@/components/ui-custom";
import { useGetArticles } from "@workspace/api-client-react";
import { format } from "date-fns";

export default function Press() {
  const { t, isAr } = useLanguage();
  const { data: articlesData } = useGetArticles();

  const articles = articlesData?.articles || [];

  return (
    <div className="min-h-screen bg-secondary/10 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-border pb-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-primary mb-2">
              {t("Press & News", "الأخبار والصحافة")}
            </h1>
            <p className="text-muted-foreground">
              {t("Updates from the simulation and platform announcements.", "تحديثات من المحاكاة وإعلانات المنصة.")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <Card key={article.id} className="group cursor-pointer flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
              {article.thumbnailUrl ? (
                <div className="h-48 overflow-hidden rounded-t-2xl">
                  <img src={article.thumbnailUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
              ) : (
                <div className="h-48 bg-navy-dark rounded-t-2xl p-6 flex flex-col justify-end">
                  <span className="text-white/50 font-display font-bold text-6xl opacity-20">YC</span>
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-center mb-4">
                  <Badge variant={article.type === "simulation" ? "gold" : "outline"}>
                    {article.type.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {format(new Date(article.publishedAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 line-clamp-2">{isAr ? article.titleAr : article.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                  {isAr ? article.contentAr : article.content}
                </p>
                <div className="pt-4 border-t border-border mt-auto flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {article.author.fullName.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-foreground">{article.author.fullName}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
