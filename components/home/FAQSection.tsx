"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { ANIMATION_CLASSES, combineAnimations } from "@/utils/animations";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <Card className={combineAnimations(
      "border-2 rounded-2xl",
      ANIMATION_CLASSES.transition.all,
      "hover:shadow-md"
    )}>
      <CardContent className="p-0">
        <button
          onClick={onToggle}
          className={combineAnimations(
            "w-full p-6 text-left flex items-center justify-between",
            ANIMATION_CLASSES.transition.colors,
            "hover:bg-gray-50"
          )}
        >
          <h3 className="font-semibold text-gray-900 pr-4">{question}</h3>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
          )}
        </button>
        
        <div className={combineAnimations(
          "overflow-hidden",
          ANIMATION_CLASSES.transition.all,
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="px-6 pb-6">
            <p className="text-gray-600 leading-relaxed">{answer}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Как записаться на тренировку?",
      answer: "Вы можете записаться через наше мобильное приложение, на сайте или обратившись к администратору. Выберите удобное время и тренера, и система автоматически забронирует для вас место."
    },
    {
      question: "Какие виды абонементов доступны?",
      answer: "Мы предлагаем различные типы абонементов: безлимитный, на определенное количество посещений, персональные тренировки, групповые занятия. Есть специальные предложения для студентов и пенсионеров."
    },
    {
      question: "Можно ли заморозить абонемент?",
      answer: "Да, абонемент можно заморозить на срок от 7 дней до 3 месяцев. Для этого необходимо подать заявление в администрации или через приложение. Заморозка возможна при наличии медицинской справки или других уважительных причин."
    },
    {
      question: "Есть ли пробные тренировки?",
      answer: "Конечно! Мы предлагаем бесплатную пробную тренировку для новых клиентов. Это отличная возможность познакомиться с нашими тренерами, оценить оборудование и атмосферу клуба."
    },
    {
      question: "Работает ли клуб в праздничные дни?",
      answer: "Да, мы работаем практически без выходных. В праздничные дни может быть сокращенный график работы. Актуальное расписание всегда доступно в приложении и на нашем сайте."
    }
  ];

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900">
            ❓ Часто задаваемые вопросы
          </h2>
        </div>
        <p className="text-xl text-gray-600">
          Ответы на самые популярные вопросы наших клиентов
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
}
