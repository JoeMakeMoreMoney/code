import SwiftUI

struct ContentView: View {
    @ObservedObject var viewModel: TimerViewModel
    @State private var sessionColor: Color = Color(hex: "#E74C3C")
    @State private var showSettings = false

    var body: some View {
        VStack(spacing: 20) {
            Text(viewModel.sessionDescription)
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(.secondary)

            TimerRingView(progress: viewModel.progress, color: sessionColor)
                .frame(width: 200, height: 200)

            Text(viewModel.timeString)
                .font(.system(size: 64, weight: .bold, design: .rounded))
                .monospacedDigit()

            Text(viewModel.sessionCounter)
                .font(.system(size: 14, weight: .regular))
                .foregroundColor(.secondary)

            ControlButtonsView(
                timerState: viewModel.timerState,
                onStart: { viewModel.toggleTimer() },
                onReset: { viewModel.reset() },
                onSkip: { viewModel.skipSession() }
            )
            .padding(.top, 4)

            Button(action: { showSettings.toggle() }) {
                HStack {
                    Image(systemName: "gear")
                    Text("设置")
                }
                .font(.system(size: 13))
            }
            .buttonStyle(.plain)
            .foregroundColor(.secondary)
            .padding(.top, 8)
        }
        .padding(32)
        .frame(minWidth: 320, minHeight: 520)
        .onReceive(viewModel.$currentSession) { session in
            updateColor(for: session)
        }
        .onReceive(viewModel.$timerState) { _ in
            updateColor(for: viewModel.currentSession)
        }
        .sheet(isPresented: $showSettings) {
            SettingsView(viewModel: viewModel)
        }
        .onAppear {
            updateColor(for: viewModel.currentSession)
        }
    }

    private func updateColor(for session: SessionType) {
        withAnimation(.easeInOut(duration: 0.3)) {
            sessionColor = Color(hex: session.color)
        }
    }
}

struct SettingsView: View {
    @ObservedObject var viewModel: TimerViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 24) {
            Text("设置")
                .font(.system(size: 20, weight: .semibold))
                .padding(.top, 8)

            Divider()

            VStack(alignment: .leading, spacing: 20) {
                SettingRow(
                    title: "工作时长",
                    value: viewModel.workDuration,
                    range: 1...60,
                    unit: "分钟",
                    onChange: { viewModel.workDuration = $0 }
                )

                SettingRow(
                    title: "短休息",
                    value: viewModel.shortBreakDuration,
                    range: 1...30,
                    unit: "分钟",
                    onChange: { viewModel.shortBreakDuration = $0 }
                )

                SettingRow(
                    title: "长休息",
                    value: viewModel.longBreakDuration,
                    range: 1...60,
                    unit: "分钟",
                    onChange: { viewModel.longBreakDuration = $0 }
                )

                Toggle("声音提醒", isOn: Binding(
                    get: { viewModel.soundEnabled },
                    set: { viewModel.soundEnabled = $0 }
                ))
                .toggleSwitchStyle()
            }
            .padding(.horizontal, 8)

            Divider()

            Text("快捷键: 空格 = 开始/暂停, R = 重置, S = 跳过")
                .font(.system(size: 12))
                .foregroundColor(.secondary)

            Button("完成") {
                dismiss()
            }
            .keyboardShortcut(.defaultAction)
            .padding(.bottom, 8)
        }
        .padding(24)
        .frame(width: 340, height: 420)
    }
}

struct SettingRow: View {
    let title: String
    let value: Int
    let range: ClosedRange<Int>
    let unit: String
    let onChange: (Int) -> Void

    var body: some View {
        HStack {
            Text(title)
                .font(.system(size: 15))

            Spacer()

            HStack(spacing: 12) {
                Button(action: {
                    if value > range.lowerBound {
                        onChange(value - 1)
                    }
                }) {
                    Image(systemName: "minus.circle.fill")
                        .font(.system(size: 22))
                        .foregroundColor(Color(hex: "#E74C3C"))
                }
                .buttonStyle(.plain)

                Text("\(value) \(unit)")
                    .font(.system(size: 15, weight: .medium))
                    .frame(minWidth: 70)

                Button(action: {
                    if value < range.upperBound {
                        onChange(value + 1)
                    }
                }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 22))
                        .foregroundColor(Color(hex: "#27AE60"))
                }
                .buttonStyle(.plain)
            }
        }
    }
}

extension View {
    func toggleSwitchStyle() -> some View {
        self.toggleStyle(.switch)
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
