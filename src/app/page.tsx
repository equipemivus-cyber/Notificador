'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Filters } from '@/components/Filters';
import { AppointmentsTable } from '@/components/AppointmentsTable';
import { AppointmentDetailsModal } from '@/components/AppointmentDetailsModal';
import { Appointment, Professional, FilterStatus, FilterTurno } from '@/types';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState('');
  const [professionalId, setProfessionalId] = useState('all');
  const [status, setStatus] = useState<FilterStatus>('Todos');
  const [turno, setTurno] = useState<FilterTurno>('Todos');
  const [activeTab, setActiveTab] = useState<'hoje' | 'anteriores' | 'este-mes'>('hoje');

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'send'>('view');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch professionals
      const { data: profData, error: profError } = await supabase
        .from('clinicorp_professionals')
        .select('*')
        .eq('business_id', '6330482543820800');

      if (profError) throw profError;
      setProfessionals(profData || []);

      // 2. Fetch appointments
      const query = supabase
        .from('clinicorp_appointments')
        .select('*')
        .eq('business_id', '6330482543820800')
        .range(0, 5000)
        .order('id', { ascending: false });

      const { data: aptData, error: aptError } = await query;
      if (aptError) throw aptError;

      // Join logic manually and add Professional name
      const enrichedAppointments = (aptData || []).map(apt => {
        const prof = profData?.find(p => p.professionals_id == apt.professional_id);
        return {
          ...apt,
          professional_name: prof?.professionals_name || 'Profissional Desconhecido'
        } as Appointment;
      });

      // Front-end filtering and sorting
      const filteredAndSorted = enrichedAppointments
        .filter(apt => {
          // Search filter
          const matchesSearch = searchTerm === '' ||
            apt.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.paciente_telefone?.includes(searchTerm) ||
            apt.appointment_id?.toString().includes(searchTerm);

          // Tab filter (Hoje e próximos vs Anteriores)
          const aptDateParts = apt.data_do_atendimento.split('/'); // DD/MM/YYYY
          const aptDateObj = new Date(parseInt(aptDateParts[2]), parseInt(aptDateParts[1]) - 1, parseInt(aptDateParts[0]));
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const isPast = aptDateObj < today;

          let matchesTab = false;
          if (activeTab === 'hoje') {
            matchesTab = !isPast;
          } else if (activeTab === 'anteriores') {
            matchesTab = isPast;
          } else if (activeTab === 'este-mes') {
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            matchesTab = aptDateObj.getMonth() === currentMonth && aptDateObj.getFullYear() === currentYear;
          }

          // Professional filter
          const matchesProf = professionalId === 'all' || apt.professional_id.toString() === professionalId;

          // Status filter
          const matchesStatus =
            status === 'Todos' ||
            (status === 'Notificado' && apt.notificado) ||
            (status === 'Não Notificado' && !apt.notificado && !apt.erro) ||
            (status === 'Erro' && apt.erro);

          // Turno filter
          const aptHour = parseInt(apt.horario_inicial_do_atendimento?.split(':')[0] || '0');
          const matchesTurno =
            turno === 'Todos' ||
            (turno === 'Manhã' && aptHour < 12) ||
            (turno === 'Tarde' && aptHour >= 12);

          // Date Picker filter
          let matchesDatePicker = true;
          if (date) {
            // Parse manual seguro: evita inconsistência de locale no toLocaleDateString
            // date vem do input como "YYYY-MM-DD"
            const [year, month, day] = date.split('-');
            const selectedDateFormatted = `${day}/${month}/${year}`;
            matchesDatePicker = apt.data_do_atendimento === selectedDateFormatted;
          }

          return matchesSearch && matchesTab && matchesProf && matchesStatus && matchesTurno && matchesDatePicker;
        })
        .sort((a, b) => {
          // Sort by Date first
          const dateA = a.data_do_atendimento.split('/').reverse().join('');
          const dateB = b.data_do_atendimento.split('/').reverse().join('');

          const dateCompare = activeTab === 'anteriores'
            ? dateB.localeCompare(dateA) // Anteriores: Descendente
            : dateA.localeCompare(dateB); // Hoje e Este Mês: Ascendente

          if (dateCompare !== 0) return dateCompare;

          // Then by Time
          return a.horario_inicial_do_atendimento.localeCompare(b.horario_inicial_do_atendimento);
        });

      setAppointments(filteredAndSorted);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, date, professionalId, status, turno, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendNotification = async (appointment: Appointment, manualMessage?: string) => {
    try {
      console.log('Triggering notification for:', appointment.appointment_id);

      const prof = professionals.find(p => p.professionals_id == appointment.professional_id);

      const payload = {
        professional_id: appointment.professional_id,
        professional_name: prof?.professionals_name || appointment.professional_name,
        patient_name: appointment.paciente_nome,
        patient_phone: appointment.paciente_telefone,
        appointment_date: appointment.data_do_atendimento,
        appointment_time: appointment.horario_inicial_do_atendimento,
        message_body_markdown: manualMessage || `Olá ${appointment.paciente_nome}, lembrando da sua consulta com ${prof?.professionals_name || appointment.professional_name} dia ${appointment.data_do_atendimento} às ${appointment.horario_inicial_do_atendimento}.`,
        send_interval_seconds: 30
      };

      // Fire and forget - não aguarda resposta do webhook
      fetch('https://webhook.mivus.com.br/webhook/sistema-notificador-mivus-agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.error('Fetch error:', err));

      // Opcional: Você pode adicionar um feedback visual rápido aqui se desejar, 
      // mas como o webhook altera o banco, o status atualizará na próxima carga.

    } catch (error: unknown) {
      console.error('Trigger error:', error);
    }
  };

  const handleMarkAsNotified = async (id: number) => {
    try {
      const { error } = await supabase
        .from('clinicorp_appointments')
        .update({ notificado: true, erro: false })
        .eq('appointment_id', id);

      if (error) throw error;

      setAppointments(prev => prev.map(a =>
        a.appointment_id === id
          ? { ...a, notificado: true, erro: false }
          : a
      ));

      if (selectedAppointment?.appointment_id === id) {
        setSelectedAppointment({ ...selectedAppointment, notificado: true, erro: false });
      }
    } catch (error) {
      console.error('Error marking as notified:', error);
    }
  };

  const handleViewDetails = (appointment: Appointment, mode: 'view' | 'send' = 'view') => {
    setSelectedAppointment(appointment);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  return (
    <main className="h-full bg-slate-50 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col p-4 md:p-6 w-full overflow-hidden">
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onRefresh={fetchData}
        />

        <Filters
          date={date}
          setDate={setDate}
          professionalId={professionalId}
          setProfessionalId={setProfessionalId}
          status={status}
          setStatus={setStatus}
          turno={turno}
          setTurno={setTurno}
          professionals={professionals}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="flex-1 min-h-0">
          <AppointmentsTable
            appointments={appointments}
            loading={loading}
            onViewDetails={handleViewDetails}
            onRetry={handleSendNotification}
          />
        </div>

        <AppointmentDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          appointment={selectedAppointment}
          onMarkAsNotified={handleMarkAsNotified}
          onSendNotification={handleSendNotification}
          initialMode={modalMode}
        />
      </div>
    </main>
  );
}
