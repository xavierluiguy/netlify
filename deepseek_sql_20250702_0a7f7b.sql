-- Políticas para inversores
CREATE POLICY "Usuários podem ver seus inversores" 
ON inversores FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus inversores"
ON inversores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para painéis
CREATE POLICY "Usuários podem ver seus painéis" 
ON paineis FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus painéis"
ON paineis FOR INSERT WITH CHECK (auth.uid() = user_id);