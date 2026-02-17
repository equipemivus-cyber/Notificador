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
  const [activeTab, setActiveTab] = useState<'hoje' | 'anteriores'>('hoje');

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      let query = supabase
        .from('clinicorp_appointments')
        .select('*')
        .eq('business_id', '6330482543820800');

      // Sort by data and horario (simplified sorting since they are strings)
      // For real production we'd use better DB types
      query = query.order('data_do_atendimento', { ascending: true })
        .order('horario_inicial_do_atendimento', { ascending: true });

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

      // Front-end filtering
      const filtered = enrichedAppointments.filter(apt => {
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
        const matchesTab = activeTab === 'hoje' ? !isPast : isPast;

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

        // Date Picker filter - only filter if date is explicitly changed or we want a specific day
        let matchesDatePicker = true;
        if (date) {
          const selectedDateFormatted = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
          matchesDatePicker = apt.data_do_atendimento === selectedDateFormatted;
        } else {
          // If no date selected, let matchesTab handle it
          matchesDatePicker = true;
        }

        return matchesSearch && matchesTab && matchesProf && matchesStatus && matchesTurno && matchesDatePicker;
      });

      setAppointments(filtered);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, date, professionalId, status, turno, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendNotification = async (appointment: Appointment) => {
    try {
      // Optimistic loading state or just handle properly
      console.log('Sending notification for:', appointment.appointment_id);

      const prof = professionals.find(p => p.professionals_id == appointment.professional_id);

      const payload = {
        professional_id: appointment.professional_id,
        professional_name: prof?.professionals_name || appointment.professional_name,
        patient_name: appointment.paciente_nome,
        patient_phone: appointment.paciente_telefone,
        appointment_date: appointment.data_do_atendimento,
        appointment_time: appointment.horario_inicial_do_atendimento,
        message_body_markdown: `Olá ${appointment.paciente_nome}, lembrando da sua consulta com ${prof?.professionals_name || appointment.professional_name} dia ${appointment.data_do_atendimento} às ${appointment.horario_inicial_do_atendimento}.`,
        send_interval_seconds: 30
      };

      const response = await fetch('https://webhook.mivus.com.br/webhook/sistema-notificador-mivus-agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Update DB
        const { error: dbError } = await supabase
          .from('clinicorp_appointments')
          .update({ notificado: true, erro: false })
          .eq('appointment_id', appointment.appointment_id);

        if (dbError) throw dbError;

        // Update local state
        setAppointments(prev => prev.map(a =>
          a.appointment_id === appointment.appointment_id
            ? { ...a, notificado: true, erro: false }
            : a
        ));

        if (selectedAppointment?.appointment_id === appointment.appointment_id) {
          setSelectedAppointment({ ...selectedAppointment, notificado: true, erro: false });
        }
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Erro do servidor');
      }
    } catch (error: any) {
      console.error('Send error:', error);

      // Update DB with error status
      await supabase
        .from('clinicorp_appointments')
        .update({ erro: true })
        .eq('appointment_id', appointment.appointment_id);

      setAppointments(prev => prev.map(a =>
        a.appointment_id === appointment.appointment_id
          ? { ...a, erro: true, error_message: error.message }
          : a
      ));

      if (selectedAppointment?.appointment_id === appointment.appointment_id) {
        setSelectedAppointment({ ...selectedAppointment, erro: true, error_message: error.message });
      }
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

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
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
            onSendNotification={handleSendNotification}
            onRetry={handleSendNotification}
          />
        </div>

        <AppointmentDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          appointment={selectedAppointment}
          onMarkAsNotified={handleMarkAsNotified}
          onSendNotification={handleSendNotification}
        />
      </div>
    </main>
  );
}
