import { NextResponse } from 'next/server';

export async function GET() {
  // Mock Questions - In production, fetch from DB
  const allQuestions = [
    {
      id: 1,
      question: "What is the traditional Rwandan greeting meaning 'Peace be with you'?",
      options: ["Muraho", "Amakuru", "Bite", "Mwaramutse"],
      correctAnswer: "Muraho"
    },
    {
      id: 2,
      question: "Which ceremony is traditionally performed to name a newborn child?",
      options: ["Gusaba", "Kwita Izina", "Gutwikurura", "Kunywana"],
      correctAnswer: "Kwita Izina"
    },
    {
      id: 3,
      question: "What does the proverb 'Agahuru k'imbwa gahye' generally signify?",
      options: ["The dog is hungry", "Things have become very serious/irreversible", "A small fire burns brightly", "Hunting is forbidden"],
      correctAnswer: "Things have become very serious/irreversible"
    },
    {
      id: 4,
      question: "In traditional Rwandan society, what is 'Umuganda'?",
      options: ["A wedding dance", "Community work", "A type of drum", "A harvest festival"],
      correctAnswer: "Community work"
    },
    {
      id: 5,
      question: "Which of these is NOT a traditional Rwandan value?",
      options: ["Kwihesha Agaciro (Dignity)", "Ubbumwe (Unity)", "Kwigira (Self-reliance)", "Ubwibone (Arrogance)"],
      correctAnswer: "Ubwibone (Arrogance)"
    },
    {
      id: 6,
      question: "What is the traditional Rwandan dance performed during celebrations?",
      options: ["Intore", "Umushagiriro", "Umudiho", "Ikinyabupfura"],
      correctAnswer: "Intore"
    },
    {
      id: 7,
      question: "In Rwandan culture, what does 'Ubuntu' represent?",
      options: ["Individual success", "Humanity and interconnectedness", "Material wealth", "Personal achievement"],
      correctAnswer: "Humanity and interconnectedness"
    }
  ];

  return NextResponse.json({ questions: allQuestions }, { status: 200 });
}