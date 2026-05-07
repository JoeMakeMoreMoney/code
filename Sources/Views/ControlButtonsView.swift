import SwiftUI

struct ControlButtonsView: View {
    let timerState: TimerState
    let onStart: () -> Void
    let onReset: () -> Void
    let onSkip: () -> Void

    var body: some View {
        HStack(spacing: 16) {
            Button(action: onReset) {
                Image(systemName: "arrow.counterclockwise")
                    .font(.system(size: 16, weight: .medium))
            }
            .buttonStyle(ControlButtonStyle())

            Button(action: onStart) {
                Image(systemName: playPauseIcon)
                    .font(.system(size: 20, weight: .bold))
            }
            .buttonStyle(PrimaryButtonStyle())

            Button(action: onSkip) {
                Image(systemName: "forward.fill")
                    .font(.system(size: 16, weight: .medium))
            }
            .buttonStyle(ControlButtonStyle())
        }
    }

    private var playPauseIcon: String {
        switch timerState {
        case .running:
            return "pause.fill"
        default:
            return "play.fill"
        }
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .foregroundColor(.white)
            .frame(width: 56, height: 56)
            .background(Color(hex: "#E74C3C"))
            .clipShape(Circle())
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

struct ControlButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .foregroundColor(.primary)
            .frame(width: 44, height: 44)
            .background(Color(hex: "#F0F0F0"))
            .clipShape(Circle())
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}
